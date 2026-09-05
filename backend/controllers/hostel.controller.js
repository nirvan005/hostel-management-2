const Hostel = require('../models/hostel.model');
const Room = require('../models/room.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Create a new hostel
// @route   POST /api/hostels
// @access  Private/SuperAdmin
exports.createHostel = asyncHandler(async (req, res, next) => {
  const hostel = await Hostel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      hostel
    }
  });
});

// @desc    Get all hostels
// @route   GET /api/hostels
// @access  Private
exports.getAllHostels = asyncHandler(async (req, res, next) => {
  let query = {};
  
  // If Warden (admin), only show their managed hostels
  if (req.user.role === 'admin') {
    query = { _id: { $in: req.user.managed_hostels } };
  }

  const hostels = await Hostel.find(query);

  res.status(200).json({
    status: 'success',
    results: hostels.length,
    data: {
      hostels
    }
  });
});

// @desc    Get a single hostel with its rooms
// @route   GET /api/hostels/:id
// @access  Private
exports.getHostel = asyncHandler(async (req, res, next) => {
  // Scoping check for wardens
  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(req.params.id)) {
    return next(new AppError('You do not have access to this hostel', 403));
  }

  const hostel = await Hostel.findById(req.params.id);
  
  if (!hostel) {
    return next(new AppError('Hostel not found', 404));
  }

  const rooms = await Room.find({ hostel_id: hostel._id });

  res.status(200).json({
    status: 'success',
    data: {
      hostel,
      rooms
    }
  });
});
