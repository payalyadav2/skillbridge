const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Protect routes - verifies JWT and attaches user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (exclude sensitive fields)
    const user = await User.findById(decoded.id)
      .select('-password -emailVerificationToken -passwordResetToken -refreshToken -socketId');

    if (!user) {
      return sendError(res, 401, 'User not found. Token is invalid.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated.');
    }

    if (user.isBanned) {
      return sendError(res, 403, `Your account has been banned. Reason: ${user.banReason || 'Policy violation'}`);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    return sendError(res, 500, 'Authentication error.');
  }
};

/**
 * Restrict to specific roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action.');
    }
    next();
  };
};

/**
 * Optional auth - attaches user if token present, continues either way
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (err) {
    // Ignore auth errors for optional auth
  }
  next();
};

module.exports = { protect, restrictTo, optionalAuth };
