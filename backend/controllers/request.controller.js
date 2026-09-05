const RoomRequest = require('../models/request.model');
const Student = require('../models/student.model');
const Room = require('../models/room.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all room requests
// @route   GET /api/requests
// @access  Private
exports.getRequests = asyncHandler(async (req, res, next) => {
  let query = {};
  
  if (req.user.role === 'student') {
    const student = await Student.findOne({ user_id: req.user._id });
    if (!student) return next(new AppError('Student profile not found', 404));
    query.student_id = student._id;
  } else if (req.user.role === 'admin') {
    query.hostel_id = { $in: req.user.managed_hostels };
  } else if (req.user.role === 'super_admin' && req.query.hostel_id) {
    query.hostel_id = req.query.hostel_id;
  }

  const requests = await RoomRequest.find(query).populate({
    path: 'student_id',
    populate: { path: 'user_id', select: 'name email phone university_id' }
  }).populate('hostel_id', 'name').sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: { requests }
  });
});

// @desc    Create a room request
// @route   POST /api/requests
// @access  Private/Student
exports.createRequest = asyncHandler(async (req, res, next) => {
  const { hostel_id, request_type, preferred_room_type, reason } = req.body;
  
  const student = await Student.findOne({ user_id: req.user._id });
  if (!student) return next(new AppError('Student profile not found', 404));

  // If new allocation, ensure they don't already have a pending one
  const existingPending = await RoomRequest.findOne({ student_id: student._id, status: 'pending' });
  if (existingPending) {
    return next(new AppError('You already have a pending room request.', 400));
  }

  const newRequest = await RoomRequest.create({
    student_id: student._id,
    hostel_id,
    request_type,
    preferred_room_type,
    reason
  });

  res.status(201).json({
    status: 'success',
    data: { request: newRequest }
  });
});

// @desc    Approve/Reject a room request
// @route   PATCH /api/requests/:id
// @access  Private/Admin
exports.updateRequest = asyncHandler(async (req, res, next) => {
  const { status, admin_comment, room_id } = req.body;
  
  const roomRequest = await RoomRequest.findById(req.params.id);
  if (!roomRequest) return next(new AppError('Request not found', 404));

  if (req.user.role === 'admin' && !req.user.managed_hostels.includes(roomRequest.hostel_id.toString())) {
    return next(new AppError('Not authorized to manage requests for this hostel', 403));
  }

  roomRequest.status = status;
  if (admin_comment) roomRequest.admin_comment = admin_comment;
  
  if (status === 'approved' && room_id) {
    const student = await Student.findById(roomRequest.student_id);
    const newRoom = await Room.findById(room_id);
    
    if (!newRoom) return next(new AppError('Room not found', 404));
    if (newRoom.status === 'maintenance') return next(new AppError('Room is under maintenance', 400));
    if (newRoom.occupants.length >= newRoom.capacity) return next(new AppError('Room is full', 400));

    // If changing room, remove from old room
    if (student.room_id) {
      const oldRoom = await Room.findById(student.room_id);
      if (oldRoom) {
        oldRoom.occupants = oldRoom.occupants.filter(id => id.toString() !== student._id.toString());
        oldRoom.status = oldRoom.occupants.length > 0 ? 'occupied' : 'vacant';
        await oldRoom.save();
      }
    }

    // Add to new room
    newRoom.occupants.push(student._id);
    newRoom.status = 'occupied';
    await newRoom.save();

    student.room_id = newRoom._id;
    student.hostel_id = newRoom.hostel_id;
    await student.save();
  }

  await roomRequest.save();

  res.status(200).json({
    status: 'success',
    data: { request: roomRequest }
  });
});
