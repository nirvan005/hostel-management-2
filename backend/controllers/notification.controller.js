const Notification = require('../models/notification.model');
const Student = require('../models/student.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user_id: req.user._id })
    .sort('-createdAt')
    .limit(20);

  res.status(200).json({
    status: 'success',
    data: { notifications }
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { notification }
  });
});

// @desc    Send reminder (Admin only)
// @route   POST /api/notifications/remind
// @access  Private/Admin
exports.sendReminder = asyncHandler(async (req, res, next) => {
  const { student_id, title, message } = req.body;

  const student = await Student.findById(student_id);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(student.hostel_id.toString())) {
    return next(new AppError('Not authorized', 403));
  }

  const notification = await Notification.create({
    user_id: student.user_id,
    title: title || 'Reminder',
    message: message || 'You have a new reminder from the Warden.',
    type: 'reminder'
  });

  res.status(201).json({
    status: 'success',
    data: { notification }
  });
});
