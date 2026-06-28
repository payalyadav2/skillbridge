const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens, verifyToken } = require('../utils/generateToken');
const { generateSecureToken, hashToken } = require('../utils/generateOTP');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const emailService = require('../services/emailService');
const achievementService = require('../services/achievementService');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendError(res, 400, 'Name, email, and password are required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendError(res, 409, 'An account with this email already exists');
  }

  // Generate email verification token
  const verificationToken = generateSecureToken();
  const hashedToken = hashToken(verificationToken);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    isEmailVerified: true,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL}/skillbridge/verify-email?token=${verificationToken}&id=${user._id}`;
emailService.sendVerificationEmail(user, verificationUrl).catch(err =>
  console.warn('Verification email failed:', err.message)
);

  // Check achievements
  await achievementService.checkAndAward(user._id, 'profile_complete');

  const { accessToken, refreshToken } = generateTokens(user._id);

  return sendSuccess(res, 201, 'Account created! Please verify your email.', {
    accessToken,
    user: user.toPublicJSON(),
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return sendError(res, 401, 'Invalid email or password');
  }

  if (user.isBanned) {
    return sendError(res, 403, `Account banned: ${user.banReason || 'Policy violation'}`);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return sendError(res, 401, 'Invalid email or password');
  }

  // Update online status
  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = generateTokens(user._id);

  return sendSuccess(res, 200, 'Login successful', {
    accessToken,
    refreshToken,
    user: user.toPublicJSON(),
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    isOnline: false,
    lastSeen: new Date(),
  });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return sendSuccess(res, 200, 'Logged out successfully');
});

// ─── Get Current User ─────────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('achievements.achievementId');

  return sendSuccess(res, 200, 'User fetched', { user: user.toPublicJSON() });
});

// ─── Verify Email ─────────────────────────────────────────────────────────────
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token, id } = req.query;

  if (!token || !id) {
    return sendError(res, 400, 'Invalid verification link');
  }

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    _id: id,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    return sendError(res, 400, 'Invalid or expired verification link');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const { accessToken } = generateTokens(user._id);

  return sendSuccess(res, 200, 'Email verified successfully! Welcome to SkillBridge.', {
    accessToken,
    user: user.toPublicJSON(),
  });
});

// ─── Resend Verification Email ────────────────────────────────────────────────
exports.resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('+emailVerificationToken +emailVerificationExpires');

  if (user.isEmailVerified) {
    return sendError(res, 400, 'Email is already verified');
  }

  const verificationToken = generateSecureToken();
  const hashedToken = hashToken(verificationToken);

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&id=${user._id}`;
  await emailService.sendVerificationEmail(user, verificationUrl);

  return sendSuccess(res, 200, 'Verification email sent');
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, 400, 'Email is required');

  const user = await User.findOne({ email: email.toLowerCase() });
  // Don't reveal if email exists
  if (!user) {
    return sendSuccess(res, 200, 'If that email exists, a reset link has been sent');
  }

  const resetToken = generateSecureToken();
  const hashedToken = hashToken(resetToken);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;

  try {
    await emailService.sendPasswordResetEmail(user, resetUrl);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return sendError(res, 500, 'Failed to send reset email. Please try again.');
  }

  return sendSuccess(res, 200, 'Password reset link sent to your email');
});

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, id, password } = req.body;

  if (!token || !id || !password) {
    return sendError(res, 400, 'All fields are required');
  }

  if (password.length < 6) {
    return sendError(res, 400, 'Password must be at least 6 characters');
  }

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    _id: id,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) {
    return sendError(res, 400, 'Invalid or expired reset link');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const { accessToken } = generateTokens(user._id);

  return sendSuccess(res, 200, 'Password reset successfully', { accessToken });
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return sendError(res, 401, 'Refresh token required');

  try {
    const decoded = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    const { accessToken } = generateTokens(decoded.id);
    return sendSuccess(res, 200, 'Token refreshed', { accessToken });
  } catch (error) {
    return sendError(res, 401, 'Invalid refresh token');
  }
});

// ─── Change Password ──────────────────────────────────────────────────────────
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) return sendError(res, 401, 'Current password is incorrect');

  if (newPassword.length < 6) {
    return sendError(res, 400, 'New password must be at least 6 characters');
  }

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, 200, 'Password changed successfully');
});
