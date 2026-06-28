const express = require('express');
const router = express.Router();
const {
  register, login, logout, getMe,
  verifyEmail, resendVerification,
  forgotPassword, resetPassword,
  refreshToken, changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, refreshLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/refresh-token', refreshLimiter, refreshToken);
router.put('/change-password', protect, changePassword);

module.exports = router;