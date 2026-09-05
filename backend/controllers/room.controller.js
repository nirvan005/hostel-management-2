const Room = require('../models/room.model');
const Hostel = require('../models/hostel.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all rooms (scoped by hostel query param)
// @route   GET /api/rooms
// @access  Private
exports.getRooms = asyncHandler(async (req, res, next) => {
  let query = {};
  
  if (req.query.hostel_id) {
    if (req.user.role === 'admin' && !req.user.managed_hostels.includes(req.query.hostel_id)) {
      return next(new AppError('You do not have access to this hostel', 403));
    }
    query.hostel_id = req.query.hostel_id;
  } else if (req.user.role === 'admin') {
    query.hostel_id = { $in: req.user.managed_hostels };
  }

  const rooms = await Room.find(query)
    .populate('hostel_id', 'name')
    .populate({
      path: 'occupants',
      populate: { path: 'user_id', select: 'name email phone university_id' }
    });

  res.status(200).json({
    status: 'success',
    results: rooms.length,
    data: {
      rooms
    }
  });
});

// @desc    Create a room inside a hostel
// @route   POST /api/hostels/:hostelId/rooms
// @access  Private/SuperAdmin
exports.createRoom = asyncHandler(async (req, res, next) => {
  const hostel = await Hostel.findById(req.params.hostelId);
  if (!hostel) {
    return next(new AppError('Hostel not found', 404));
  }

  req.body.hostel_id = req.params.hostelId;
  const room = await Room.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      room
    }
  });
});

// @desc    Update room status (maintenance etc)
// @route   PATCH /api/rooms/:id
// @access  Private/Admin
exports.updateRoomStatus = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return next(new AppError('Room not found', 404));
  }

  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(room.hostel_id.toString())) {
    return next(new AppError('Not authorized to update this room', 403));
  }

  room.status = req.body.status;
  await room.save();

  res.status(200).json({
    status: 'success',
    data: {
      room
    }
  });
});
