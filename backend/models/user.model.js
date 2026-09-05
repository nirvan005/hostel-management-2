const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'super_admin'],
    required: true
  },
  university_id: {
    type: String,
    unique: true,
    sparse: true // Only required for students
  },
  managed_hostels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  }],
  refreshToken: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
