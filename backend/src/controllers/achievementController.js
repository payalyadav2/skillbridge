const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const achievementService = require('../services/achievementService');

// ─── Get All Achievements ─────────────────────────────────────────────────────
exports.getAllAchievements = asyncHandler(async (req, res) => {
  const [achievements, user] = await Promise.all([
    Achievement.find({ isActive: true }).sort({ tier: 1, order: 1 }),
    User.findById(req.user._id).populate('achievements.achievementId'),
  ]);

  const earnedIds = user.achievements.map(a => a.achievementId?._id?.toString());

  const enriched = achievements.map(achievement => ({
    ...achievement.toObject(),
    isEarned: earnedIds.includes(achievement._id.toString()),
    earnedAt: user.achievements.find(
      a => a.achievementId?._id?.toString() === achievement._id.toString()
    )?.earnedAt,
  }));

  return sendSuccess(res, 200, 'Achievements', {
    achievements: enriched,
    userPoints: user.points,
    userLevel: user.level,
    earnedCount: earnedIds.length,
    totalCount: achievements.length,
  });
});

// ─── Seed Default Achievements ────────────────────────────────────────────────
exports.seedAchievements = asyncHandler(async (req, res) => {
  await achievementService.seedAchievements();
  return sendSuccess(res, 200, 'Achievements seeded');
});

// ─── Get Leaderboard ──────────────────────────────────────────────────────────
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await User.find({ isActive: true, isBanned: false })
    .select('name avatar points level totalExchanges averageRating')
    .sort({ points: -1 })
    .limit(20);

  return sendSuccess(res, 200, 'Leaderboard', { leaderboard });
});
