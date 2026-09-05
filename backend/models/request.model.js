const mongoose = require('mongoose');

const roomRequestSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  hostel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  request_type: {
    type: String,
    enum: ['new_allocation', 'room_change'],
    required: true
  },
  preferred_room_type: {
    type: String, // e.g. "1-Seater", "2-Seater"
  },
  reason: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_comment: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RoomRequest', roomRequestSchema);
