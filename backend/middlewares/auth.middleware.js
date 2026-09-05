const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/user.model');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    console.log('401 Auth Error: No token found for route', req.originalUrl);
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Attach user to req (excluding password)
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    next();
  } catch (err) {
    console.log('401 Auth Error: Token verification failed for route', req.originalUrl, err.message);
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`User role ${req.user.role} is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

// Ensure Warden can only access data for their assigned hostels
exports.scopeToHostel = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next(); // Super admin has global access
  }

  if (req.user.role === 'admin') {
    // For GET/PUT/DELETE requests targeting a specific hostel or resource linked to a hostel,
    // The actual route handler needs to verify that the target hostel_id is within req.user.managed_hostels.
    // This middleware just ensures they have at least one hostel assigned.
    if (!req.user.managed_hostels || req.user.managed_hostels.length === 0) {
       return next(new AppError('You are not assigned to manage any hostels.', 403));
    }
  }

  next();
};
