const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Invite = require('../models/invite.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const signToken = (id) => {
  return jwt.sign({ userId: id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + 24 * 60 * 60 * 1000 // 1 day, adjust based on env config
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('access_token', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// @desc    Unified Login for all roles
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  res.cookie('access_token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

// @desc    Student Registration
// @route   POST /api/auth/register-student
// @access  Public
exports.registerStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, university_id } = req.body;

  const existingUser = await User.findOne({ 
    $or: [
      { email },
      { phone }
    ]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return next(new AppError('Email is already in use', 400));
    }
    if (existingUser.phone === phone) {
      return next(new AppError('Phone number is already in use', 400));
    }
  }

  // NOTE: Students do NOT get assigned a hostel or room here. 
  // They apply for it, or an admin assigns it later.
  const newUser = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    phone,
    university_id,
    role: 'student'
  });

  createSendToken(newUser, 201, res);
});

// @desc    Warden/Admin Registration via Secure Invite Link
// @route   POST /api/auth/register-admin
// @access  Public
exports.registerAdmin = asyncHandler(async (req, res, next) => {
  const { token, name, password, phone } = req.body;

  if (!token) {
    return next(new AppError('Invite token is required', 400));
  }

  const invite = await Invite.findOne({ token, status: 'pending' });
  
  if (!invite) {
    return next(new AppError('Invalid or expired invite token', 400));
  }
  
  if (invite.expiresAt < Date.now()) {
    invite.status = 'expired';
    await invite.save();
    return next(new AppError('Invite token has expired', 400));
  }

  // Create the admin user based on invite details
  const newUser = await User.create({
    name,
    email: invite.email, // Force email from invite
    password: await bcrypt.hash(password, 10),
    phone,
    role: invite.role, // 'admin' usually
    managed_hostels: invite.hostels
  });

  // Mark invite as used
  invite.status = 'accepted';
  await invite.save();

  createSendToken(newUser, 201, res);
});
