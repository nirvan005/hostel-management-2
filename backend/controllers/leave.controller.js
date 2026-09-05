const Leave = require('../models/leave.model');
const Student = require('../models/student.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Apply for an out-pass (leave)
// @route   POST /api/leaves
// @access  Private/Student
exports.applyLeave = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ user_id: req.user._id });
  if (!student || !student.hostel_id) {
    return next(new AppError('You must be assigned to a hostel to request a leave', 400));
  }

  const { reason, start_date, end_date } = req.body;

  const leave = await Leave.create({
    student_id: student._id,
    hostel_id: student.hostel_id,
    reason,
    start_date,
    end_date
  });

  res.status(201).json({
    status: 'success',
    data: {
      leave
    }
  });
});

// @desc    Get all leaves (Scoped)
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = asyncHandler(async (req, res, next) => {
  let query = {};
  
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user_id: req.user._id });
    if (!student) return next(new AppError('Student profile not found', 404));
    query.student_id = student._id;
  } else if (req.user.role === 'admin') {
    query.hostel_id = { $in: req.user.managed_hostels };
  }

  const leaves = await Leave.find(query).populate({
    path: 'student_id',
    populate: { path: 'user_id', select: 'name email phone' }
  });

  res.status(200).json({
    status: 'success',
    results: leaves.length,
    data: {
      leaves
    }
  });
});

// @desc    Update Leave Status (Approve/Reject)
// @route   PATCH /api/leaves/:id/status
// @access  Private/Admin
exports.updateLeaveStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const leave = await Leave.findById(req.params.id);
  
  if (!leave) return next(new AppError('Leave not found', 404));

  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(leave.hostel_id.toString())) {
    return next(new AppError('Not authorized', 403));
  }

  leave.status = status;
  leave.approved_by = req.user._id;
  await leave.save();

  res.status(200).json({
    status: 'success',
    data: {
      leave
    }
  });
});

// @desc    Mark Exit/Entry (Security/Warden action)
// @route   PATCH /api/leaves/:id/gate
// @access  Private/Admin
exports.markGateMovement = asyncHandler(async (req, res, next) => {
  const { action } = req.body; // 'exit' or 'entry'
  const leave = await Leave.findById(req.params.id);
  
  if (!leave) return next(new AppError('Leave not found', 404));

  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(leave.hostel_id.toString())) {
    return next(new AppError('Not authorized', 403));
  }

  if (action === 'exit') {
    leave.actual_exit_time = Date.now();
    leave.status = 'active';
  } else if (action === 'entry') {
    leave.actual_entry_time = Date.now();
    leave.status = 'completed';
  } else {
    return next(new AppError('Invalid action. Must be exit or entry', 400));
  }

  await leave.save();

  res.status(200).json({
    status: 'success',
    data: {
      leave
    }
  });
});
