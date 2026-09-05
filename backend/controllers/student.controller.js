const Student = require('../models/student.model');
const Room = require('../models/room.model');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get current student profile
// @route   GET /api/students/me
// @access  Private/Student
exports.getMe = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'student') {
    return next(new AppError('Only students can access this route', 403));
  }

  const student = await Student.findOne({ user_id: req.user._id })
    .populate('user_id', 'name email phone university_id')
    .populate('hostel_id', 'name')
    .populate('room_id', 'room_number floor block');

  if (!student) {
    return next(new AppError('Student profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      student
    }
  });
});

// @desc    Get all students (scoped by hostel)
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = asyncHandler(async (req, res, next) => {
  let query = {};
  
  if (req.user.role === 'admin') {
    query.hostel_id = { $in: req.user.managed_hostels };
  } else if (req.user.role === 'student') {
    return next(new AppError('Students cannot view the student directory', 403));
  }

  const students = await Student.find(query)
    .populate('user_id', 'name email phone university_id')
    .populate('hostel_id', 'name')
    .populate('room_id', 'room_number block');

  res.status(200).json({
    status: 'success',
    results: students.length,
    data: {
      students
    }
  });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id)
    .populate('user_id', 'name email phone university_id')
    .populate('hostel_id', 'name')
    .populate('room_id', 'room_number block');

  if (!student) {
    return next(new AppError('Student profile not found', 404));
  }

  // Scoping: Students can only view themselves
  if (req.user.role === 'student' && student.user_id._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only view your own profile', 403));
  }

  // Scoping: Wardens can only view students in their hostels
  if (req.user.role === 'admin') {
    if (student.hostel_id && !req.user.managed_hostels.includes(student.hostel_id._id.toString())) {
      return next(new AppError('Student is not in your managed hostels', 403));
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      student
    }
  });
});

// @desc    Assign room to student
// @route   POST /api/students/:id/assign-room
// @access  Private/Admin
exports.assignRoom = asyncHandler(async (req, res, next) => {
  const { room_id } = req.body;
  
  if (!room_id) {
    return next(new AppError('Please provide a room_id', 400));
  }

  const student = await Student.findById(req.params.id);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  const room = await Room.findById(room_id);
  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(room.hostel_id.toString())) {
    return next(new AppError('You cannot assign a student to a room outside your managed hostels', 403));
  }

  if (room.occupants.length >= room.capacity) {
    return next(new AppError('Room is full', 400));
  }
  
  if (room.status === 'maintenance') {
    return next(new AppError('Room is under maintenance', 400));
  }

  // If student is already in a room, remove them from the old room
  if (student.room_id) {
    const oldRoom = await Room.findById(student.room_id);
    if (oldRoom) {
      oldRoom.occupants = oldRoom.occupants.filter(occ => occ.toString() !== student._id.toString());
      if (oldRoom.occupants.length === 0) {
        oldRoom.status = 'vacant';
      }
      await oldRoom.save();
    }
  }

  // Assign to new room
  student.room_id = room._id;
  student.hostel_id = room.hostel_id;
  await student.save();

  room.occupants.push(student._id);
  room.status = 'occupied';
  await room.save();

  res.status(200).json({
    status: 'success',
    message: 'Room assigned successfully',
    data: {
      student,
      room
    }
  });
});
