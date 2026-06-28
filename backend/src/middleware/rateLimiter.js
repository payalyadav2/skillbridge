const rateLimit = require('express-rate-limit');

const options = {
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
};

const rateLimiter = rateLimit({
  ...options,
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  max: process.env.RATE_LIMIT_MAX || 10000,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  ...options,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

const refreshLimiter = rateLimit({
  ...options,
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many refresh attempts.' },
});

const aiLimiter = rateLimit({
  ...options,
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many AI requests, please slow down.' },
});

module.exports = { rateLimiter, authLimiter, refreshLimiter, aiLimiter };