const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated, getPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const matchingService = require('../services/matchingService');
const achievementService = require('../services/achievementService');
const { cloudinary } = require('../config/cloudinary');

// ─── Get User Profile ─────────────────────────────────────────────────────────
exports.getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id)
    .populate('achievements.achievementId')
    .select('-password -emailVerificationToken -passwordResetToken -socketId');

  if (!user || !user.isActive) return sendError(res, 404, 'User not found');
  if (user.isBanned) return sendError(res, 403, 'This account is unavailable');

  return sendSuccess(res, 200, 'User profile fetched', { user });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'bio', 'headline', 'experienceLevel',
    'website', 'github', 'linkedin', 'twitter', 'preferences'
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('achievements.achievementId');

  // Check achievements
  await achievementService.checkAndAward(user._id, 'profile_update');

  return sendSuccess(res, 200, 'Profile updated successfully', { user: user.toPublicJSON() });
});

// ─── Upload Avatar ────────────────────────────────────────────────────────────
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 400, 'No image file provided');

  // Delete old avatar from Cloudinary
  const existingUser = await User.findById(req.user._id);
  if (existingUser.avatar) {
    const publicId = existingUser.avatar.split('/').slice(-2).join('/').split('.')[0];
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn('Failed to delete old avatar:', err.message);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path },
    { new: true }
  );

  return sendSuccess(res, 200, 'Avatar updated', { avatar: user.avatar });
});

// ─── Update Location ──────────────────────────────────────────────────────────
exports.updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude, city, state, country, displayAddress } = req.body;

  if (!latitude || !longitude) {
    return sendError(res, 400, 'Latitude and longitude are required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      'location.type': 'Point',
      'location.coordinates': [parseFloat(longitude), parseFloat(latitude)],
      'location.city': city,
      'location.state': state,
      'location.country': country,
      'location.displayAddress': displayAddress,
    },
    { new: true }
  );

  return sendSuccess(res, 200, 'Location updated', {
    location: user.location
  });
});

// ─── Add Skill Offered ────────────────────────────────────────────────────────
exports.addSkillOffered = asyncHandler(async (req, res) => {
  const { name, category, level, description, yearsOfExperience } = req.body;

  if (!name) return sendError(res, 400, 'Skill name is required');

  const user = await User.findById(req.user._id);
  const alreadyExists = user.skillsOffered.some(
    s => s.name.toLowerCase() === name.toLowerCase()
  );

  if (alreadyExists) return sendError(res, 409, 'Skill already added');

  user.skillsOffered.push({ name, category, level, description, yearsOfExperience });
  await user.save();

  // Also save to Skills collection for Browse Skills page
  try {
    const Skill = require('../models/Skill');
    const skillExists = await Skill.findOne({ 
      name: new RegExp(`^${name}$`, 'i'), 
      owner: req.user._id 
    });
    if (!skillExists) {
      await Skill.create({
        name,
        category: category || 'Other',
        level: level || 'beginner',
        description: description || '',
        owner: req.user._id,
        type: 'offered',
        exchangePreference: user.preferences?.exchangePreference || 'both',
      });
    }
  } catch (err) {
    console.warn('Skill collection save failed:', err.message);
  }

  await achievementService.checkAndAward(user._id, 'skill_added');

  return sendSuccess(res, 201, 'Skill added', { skillsOffered: user.skillsOffered });
});

// ─── Remove Skill Offered ─────────────────────────────────────────────────────
exports.removeSkillOffered = asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { skillsOffered: { _id: skillId } } },
    { new: true }
  );

  return sendSuccess(res, 200, 'Skill removed', { skillsOffered: user.skillsOffered });
});

// ─── Add Skill Wanted ─────────────────────────────────────────────────────────
exports.addSkillWanted = asyncHandler(async (req, res) => {
  const { name, category, currentLevel, targetLevel } = req.body;

  if (!name) return sendError(res, 400, 'Skill name is required');

  const user = await User.findById(req.user._id);
  const alreadyExists = user.skillsWanted.some(
    s => s.name.toLowerCase() === name.toLowerCase()
  );

  if (alreadyExists) return sendError(res, 409, 'Already in your wanted list');

  user.skillsWanted.push({ name, category, currentLevel, targetLevel });
  await user.save();

  return sendSuccess(res, 201, 'Skill added to wanted list', { skillsWanted: user.skillsWanted });
});

// ─── Remove Skill Wanted ──────────────────────────────────────────────────────
exports.removeSkillWanted = asyncHandler(async (req, res) => {
  const { skillId } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { skillsWanted: { _id: skillId } } },
    { new: true }
  );

  return sendSuccess(res, 200, 'Skill removed from wanted list', { skillsWanted: user.skillsWanted });
});

// ─── Update Learning Progress ─────────────────────────────────────────────────
exports.updateLearningProgress = asyncHandler(async (req, res) => {
  const { skillName, progressPercent, notes } = req.body;

  const user = await User.findById(req.user._id);
  const existingIndex = user.learningProgress.findIndex(
    lp => lp.skillName.toLowerCase() === skillName.toLowerCase()
  );

  if (existingIndex >= 0) {
    user.learningProgress[existingIndex].progressPercent = progressPercent;
    user.learningProgress[existingIndex].notes = notes;
    user.learningProgress[existingIndex].lastUpdated = new Date();
  } else {
    user.learningProgress.push({
      skillName,
      progressPercent,
      notes,
      sessionsCompleted: 0,
    });
  }

  await user.save();
  await achievementService.checkAndAward(user._id, 'progress_update');

  return sendSuccess(res, 200, 'Learning progress updated', {
    learningProgress: user.learningProgress
  });
});

// ─── Search Users ─────────────────────────────────────────────────────────────
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q, skill, category, level, experienceLevel, page = 1, limit = 12 } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = {
    isActive: true,
    isBanned: false,
    'preferences.isProfilePublic': true,
    _id: { $ne: req.user?._id },
  };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Skill filter
  if (skill) {
    const skillRegex = new RegExp(skill, 'i');
    query.$or = [
      { 'skillsOffered.name': skillRegex },
      { 'skillsWanted.name': skillRegex },
    ];
  }

  // Category filter
  if (category) {
    query['skillsOffered.category'] = category;
  }

  // Level filter
  if (level) {
    query['skillsOffered.level'] = level;
  }

  // Experience level
  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name avatar bio skillsOffered skillsWanted experienceLevel averageRating totalReviews totalExchanges isOnline lastSeen location')
      .sort(q ? { score: { $meta: 'textScore' } } : { averageRating: -1, totalExchanges: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return sendPaginated(res, 'Users found', users, {
    page: parseInt(page), limit: parseInt(limit), total
  });
});

// ─── Get Nearby Users (Geolocation) ──────────────────────────────────────────
exports.getNearbyUsers = asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 25, page = 1, limit = 20 } = req.query;

  if (!latitude || !longitude) {
    return sendError(res, 400, 'Location coordinates are required');
  }

  const { skip } = getPagination({ page, limit });

  const users = await User.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseFloat(maxDistance) * 1000,
      },
    },
    isActive: true,
    isBanned: false,
    'preferences.isProfilePublic': true,
    'preferences.showLocation': true,
    _id: { $ne: req.user._id },
  })
    .select('name avatar bio skillsOffered skillsWanted experienceLevel averageRating isOnline location')
    .skip(skip)
    .limit(parseInt(limit));

  return sendSuccess(res, 200, 'Nearby users fetched', { users, count: users.length });
});

// ─── Get Skill Matches ────────────────────────────────────────────────────────
exports.getMatches = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const options = {
    limit: parseInt(req.query.limit) || 20,
    page: parseInt(req.query.page) || 1,
    category: req.query.category,
    maxDistance: req.query.maxDistance ? parseInt(req.query.maxDistance) : undefined,
  };

  const result = await matchingService.findMatches(user, options);

  return sendSuccess(res, 200, 'Skill matches found', result);
});

// ─── Get Dashboard Stats ──────────────────────────────────────────────────────
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const ExchangeRequest = require('../models/ExchangeRequest');
  const Session = require('../models/Session');
  const Review = require('../models/Review');
  const Notification = require('../models/Notification');

  const [
    user,
    pendingRequests,
    activeExchanges,
    upcomingSessions,
    unreadNotifications,
    recentReviews,
  ] = await Promise.all([
    User.findById(userId).populate('achievements.achievementId'),
    ExchangeRequest.countDocuments({ receiver: userId, status: 'pending' }),
    ExchangeRequest.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted',
    }),
    Session.find({
      $or: [{ host: userId }, { participant: userId }],
      status: 'scheduled',
      scheduledAt: { $gte: new Date() },
    }).sort({ scheduledAt: 1 }).limit(3).populate('host participant', 'name avatar'),
    Notification.countDocuments({ recipient: userId, isRead: false }),
    Review.find({ reviewee: userId }).sort({ createdAt: -1 }).limit(3)
      .populate('reviewer', 'name avatar'),
  ]);

  return sendSuccess(res, 200, 'Dashboard stats', {
    stats: {
      totalExchanges: user.totalExchanges,
      totalSessions: user.totalSessions,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
      points: user.points,
      level: user.level,
      pendingRequests,
      activeExchanges,
      unreadNotifications,
    },
    upcomingSessions,
    recentReviews,
    achievements: user.achievements,
    profileCompleteness: user.profileCompleteness,
  });
});
