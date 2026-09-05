const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hostel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  room_number: {
    type: String,
    required: true,
    trim: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant'
  },
  amenities: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Compound index to ensure room numbers are unique within a hostel
roomSchema.index({ hostel_id: 1, room_number: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
