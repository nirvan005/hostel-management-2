const Student = require('../models/student.model');
const Invoice = require('../models/invoice.model');
const Room = require('../models/room.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Global Search
// @route   GET /api/search
// @access  Private
exports.globalSearch = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.status(200).json({ status: 'success', data: { results: [] } });
  }

  // Escape regex
  const regex = new RegExp(q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');

  const [students, invoices, rooms] = await Promise.all([
    Student.find({ enrollment_number: regex }).populate('user_id', 'name email').limit(5),
    Invoice.find({ title: regex }).limit(5),
    Room.find({ room_number: regex }).populate('hostel_id', 'name').limit(5)
  ]);

  const results = [];
  
  students.forEach(s => {
    results.push({
      type: 'Student',
      id: s._id,
      title: s.user_id?.name || s.enrollment_number,
      subtitle: s.enrollment_number,
      link: '/admin/students'
    });
  });

  invoices.forEach(i => {
    results.push({
      type: 'Invoice',
      id: i._id,
      title: i.title,
      subtitle: i.amount.toString(),
      link: '/admin/invoices'
    });
  });

  rooms.forEach(r => {
    results.push({
      type: 'Room',
      id: r._id,
      title: r.room_number,
      subtitle: r.hostel_id?.name,
      link: '/admin/rooms'
    });
  });

  res.status(200).json({
    status: 'success',
    data: { results }
  });
});
