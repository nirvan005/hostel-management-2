const Invite = require('../models/invite.model');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all active invites
// @route   GET /api/invites
// @access  Private/SuperAdmin
exports.getInvites = asyncHandler(async (req, res, next) => {
  const invites = await Invite.find().populate('hostels', 'name');
  
  res.status(200).json({
    status: 'success',
    results: invites.length,
    data: {
      invites
    }
  });
});

// @desc    Create a new invite token
// @route   POST /api/invites
// @access  Private/SuperAdmin
exports.createInvite = asyncHandler(async (req, res, next) => {
  const { email, role, hostels } = req.body;

  if (!email) return next(new AppError('Please provide an email for the invite', 400));

  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiration (e.g., 7 days)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await Invite.create({
    email,
    token,
    role: role || 'admin',
    hostels: hostels || [],
    invitedBy: req.user._id,
    expiresAt
  });

  // In a real app, you would SEND AN EMAIL here with the link: 
  // http://localhost:5173/admin/register?token=${token}

  res.status(201).json({
    status: 'success',
    message: 'Invite created. Please share the token with the new staff member.',
    data: {
      invite,
      token // Return token for dev purposes
    }
  });
});
