const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  hostel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  emergency_contact: {
    name: String,
    phone: String,
    relation: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
