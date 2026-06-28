const User = require('../models/User');
const Session = require('../models/Session');
const ExchangeRequest = require('../models/ExchangeRequest');
const Review = require('../models/Review');
const { sendSuccess, sendError, sendPaginated, getPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Platform Overview Stats ──────────────────────────────────────────────────
exports.getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOf30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    newUsersToday,
    newUsers7Days,
    newUsers30Days,
    totalSessions,
    completedSessions,
    ongoingSessions,
    sessionsToday,
    totalExchanges,
    pendingExchanges,
    acceptedExchanges,
    totalReviews,
    onlineNow,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true, isBanned: false }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({ createdAt: { $gte: startOf7Days } }),
    User.countDocuments({ createdAt: { $gte: startOf30Days } }),
    Session.countDocuments({}),
    Session.countDocuments({ status: 'completed' }),
    Session.countDocuments({ status: 'ongoing' }),
    Session.countDocuments({ createdAt: { $gte: startOfToday } }),
    ExchangeRequest.countDocuments({}),
    ExchangeRequest.countDocuments({ status: 'pending' }),
    ExchangeRequest.countDocuments({ status: 'accepted' }),
    Review.countDocuments({}),
    User.countDocuments({ isOnline: true }),
  ]);

  // Growth rate (30 day vs prev 30 day)
  const prev30Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const prevUsers = await User.countDocuments({
    createdAt: { $gte: prev30Days, $lt: startOf30Days },
  });
  const growthRate = prevUsers > 0
    ? Math.round(((newUsers30Days - prevUsers) / prevUsers) * 100)
    : 100;

  // ── NEW: average review rating ────────────────────────────────────────────
  const avgRatingResult = await Review.aggregate([
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ]);
  const avgRating = avgRatingResult[0]?.avg ?? null;
  // ─────────────────────────────────────────────────────────────────────────

  return sendSuccess(res, 200, 'Admin stats fetched', {
    users: {
      total: totalUsers,
      active: activeUsers,
      banned: bannedUsers,
      newToday: newUsersToday,
      new7Days: newUsers7Days,
      new30Days: newUsers30Days,
      onlineNow,
      growthRate,
    },
    sessions: {
      total: totalSessions,
      completed: completedSessions,
      ongoing: ongoingSessions,
      today: sessionsToday,
      completionRate: totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0,
    },
    exchanges: {
      total: totalExchanges,
      pending: pendingExchanges,
      accepted: acceptedExchanges,
      acceptanceRate: totalExchanges > 0
        ? Math.round((acceptedExchanges / totalExchanges) * 100)
        : 0,
    },
    reviews: {
      total: totalReviews,
      avgRating,            // ← NEW: frontend pe "Avg ★ 4.2" dikhega
    },
  });
});

// ─── User Growth Chart Data (last 30 days) ─────────────────────────────────
exports.getGrowthData = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(1, parseInt(req.query.days) || 30), 365);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ];

  const userGrowth = await User.aggregate(pipeline);
  const sessionGrowth = await Session.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  const formatEntry = (entry) => ({
    date: `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}-${String(entry._id.day).padStart(2, '0')}`,
    count: entry.count,
  });

  return sendSuccess(res, 200, 'Growth data fetched', {
    users: userGrowth.map(formatEntry),
    sessions: sessionGrowth.map(formatEntry),
  });
});

// ─── All Users (paginated, filterable) ────────────────────────────────────────
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, role, status, sort = '-createdAt' } = req.query;

  const ALLOWED_SORTS = ['-createdAt', 'createdAt', '-name', 'name', '-email', 'email', '-averageRating', 'averageRating'];
  const safeSort = ALLOWED_SORTS.includes(sort) ? sort : '-createdAt';

  const filter = {};
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
    ];
  }
  if (role && ['user', 'admin', 'moderator'].includes(role)) filter.role = role;
  if (status === 'banned') filter.isBanned = true;
  else if (status === 'inactive') filter.isActive = false;
  else if (status === 'active') { filter.isActive = true; filter.isBanned = false; }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password -emailVerificationToken -passwordResetToken -refreshToken -socketId')
    .sort(safeSort)
    .skip(skip)
    .limit(limit)
    .lean();

  return sendPaginated(res, 'Users fetched', { users }, { page, limit, total });
});

// ─── Get Single User Detail ────────────────────────────────────────────────────
exports.getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -emailVerificationToken -passwordResetToken -refreshToken -socketId')
    .populate('achievements.achievementId')
    .lean();

  if (!user) return sendError(res, 404, 'User not found');

  const [userSessions, userExchanges, userReviews] = await Promise.all([
    Session.countDocuments({ $or: [{ host: user._id }, { participant: user._id }] }),
    ExchangeRequest.countDocuments({ $or: [{ sender: user._id }, { receiver: user._id }] }),
    Review.countDocuments({ reviewee: user._id }),
  ]);

  return sendSuccess(res, 200, 'User detail fetched', {
    user,
    stats: { sessions: userSessions, exchanges: userExchanges, reviews: userReviews },
  });
});

// ─── Ban User ─────────────────────────────────────────────────────────────────
exports.banUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const userId = req.params.id;

  if (userId === req.user._id.toString()) {
    return sendError(res, 400, 'You cannot ban yourself');
  }

  const user = await User.findById(userId);
  if (!user) return sendError(res, 404, 'User not found');
  if (user.role === 'admin') return sendError(res, 403, 'Cannot ban another admin');

  user.isBanned = true;
  user.banReason = reason || 'Policy violation';
  await user.save();

  return sendSuccess(res, 200, 'User banned successfully', {
    userId,
    banReason: user.banReason,
  });
});

// ─── Unban User ───────────────────────────────────────────────────────────────
exports.unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, 'User not found');

  user.isBanned = false;
  user.banReason = undefined;
  await user.save();

  return sendSuccess(res, 200, 'User unbanned successfully', { userId: req.params.id });
});

// ─── Change User Role ─────────────────────────────────────────────────────────
exports.changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!['user', 'moderator', 'admin'].includes(role)) {
    return sendError(res, 400, 'Invalid role. Must be: user, moderator, or admin');
  }
  if (userId === req.user._id.toString()) {
    return sendError(res, 400, 'You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select('name email role');

  if (!user) return sendError(res, 404, 'User not found');

  return sendSuccess(res, 200, 'User role updated', { user });
});

// ─── Delete User ──────────────────────────────────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (userId === req.user._id.toString()) {
    return sendError(res, 400, 'You cannot delete yourself');
  }

  const user = await User.findById(userId);
  if (!user) return sendError(res, 404, 'User not found');
  if (user.role === 'admin') return sendError(res, 403, 'Cannot delete another admin');

  // Soft delete — deactivate instead of hard delete
  user.isActive = false;
  user.isBanned = true;
  user.banReason = `Account deleted by admin on ${new Date().toISOString()}`;
  await user.save();

  return sendSuccess(res, 200, 'User account deactivated', { userId });
});

// ─── All Sessions ─────────────────────────────────────────────────────────────
exports.getAllSessions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, sort = '-createdAt' } = req.query;

  const ALLOWED_SORTS = ['-createdAt', 'createdAt', '-scheduledAt', 'scheduledAt', '-status', 'status'];
  const safeSort = ALLOWED_SORTS.includes(sort) ? sort : '-createdAt';

  const filter = {};
  if (status) filter.status = status;

  const total = await Session.countDocuments(filter);
  const sessions = await Session.find(filter)
    .populate('host', 'name email avatar')
    .populate('participant', 'name email avatar')
    .sort(safeSort)
    .skip(skip)
    .limit(limit)
    .lean();

  return sendPaginated(res, 'Sessions fetched', { sessions }, { page, limit, total });
});

// ─── Delete Session ───────────────────────────────────────────────────────────
exports.deleteSession = asyncHandler(async (req, res) => {
  const session = await Session.findByIdAndDelete(req.params.id);
  if (!session) return sendError(res, 404, 'Session not found');
  return sendSuccess(res, 200, 'Session deleted', { sessionId: req.params.id });
});

// ─── All Exchange Requests ────────────────────────────────────────────────────
exports.getAllExchanges = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, sort = '-createdAt' } = req.query;

  const ALLOWED_SORTS = ['-createdAt', 'createdAt', '-status', 'status'];
  const safeSort = ALLOWED_SORTS.includes(sort) ? sort : '-createdAt';

  const filter = {};
  if (status) filter.status = status;

  const total = await ExchangeRequest.countDocuments(filter);
  const exchanges = await ExchangeRequest.find(filter)
    .populate('sender', 'name email avatar')
    .populate('receiver', 'name email avatar')
    .sort(safeSort)
    .skip(skip)
    .limit(limit)
    .lean();

  return sendPaginated(res, 'Exchanges fetched', { exchanges }, { page, limit, total });
});

// ─── All Reviews ──────────────────────────────────────────────────────────────
exports.getAllReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { sort = '-createdAt', rating } = req.query;   // ← rating add kiya

  const ALLOWED_SORTS = ['-createdAt', 'createdAt', '-rating', 'rating'];
  const safeSort = ALLOWED_SORTS.includes(sort) ? sort : '-createdAt';

  // ── NEW: rating filter ────────────────────────────────────────────────────
  const filter = {};
  if (rating) {
    const r = parseInt(rating, 10);
    if (r >= 1 && r <= 5) filter.rating = r;
  }
  // ─────────────────────────────────────────────────────────────────────────

  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('reviewer', 'name email avatar')
    .populate('reviewee', 'name email avatar')
    .sort(safeSort)
    .skip(skip)
    .limit(limit)
    .lean();

  return sendPaginated(res, 'Reviews fetched', { reviews }, { page, limit, total });
});

// ─── Delete Review ────────────────────────────────────────────────────────────
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return sendError(res, 404, 'Review not found');
  return sendSuccess(res, 200, 'Review deleted', { reviewId: req.params.id });
});

// ─── Recent Activity Feed ──────────────────────────────────────────────────────
exports.getRecentActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  const [recentUsers, recentSessions, recentExchanges] = await Promise.all([
    User.find({})
      .sort('-createdAt')
      .limit(limit)
      .select('name email avatar createdAt role')
      .lean(),
    Session.find({})
      .sort('-createdAt')
      .limit(limit)
      .populate('host', 'name avatar')
      .select('title status createdAt host')
      .lean(),
    ExchangeRequest.find({})
      .sort('-createdAt')
      .limit(limit)
      .populate('sender', 'name avatar')
      .select('skillOffered skillWanted status createdAt sender')
      .lean(),
  ]);

  const activity = [
    ...recentUsers.map(u => ({
      type: 'user_joined',
      message: `${u.name} joined SkillBridge`,
      actor: u,
      timestamp: u.createdAt,
    })),
    ...recentSessions.map(s => ({
      type: 'session_created',
      message: `Session "${s.title}" created`,
      actor: s.host,
      timestamp: s.createdAt,
      status: s.status,
    })),
    ...recentExchanges.map(e => ({
      type: 'exchange_requested',
      message: `${e.sender?.name} requested "${e.skillOffered?.name}" ↔ "${e.skillWanted?.name}"`,
      actor: e.sender,
      timestamp: e.createdAt,
      status: e.status,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);

  return sendSuccess(res, 200, 'Activity feed fetched', { activity });
});

// ─── Top Skills on Platform ────────────────────────────────────────────────────
exports.getTopSkills = asyncHandler(async (req, res) => {
  const topOffered = await User.aggregate([
    { $unwind: '$skillsOffered' },
    { $group: { _id: '$skillsOffered.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const topWanted = await User.aggregate([
    { $unwind: '$skillsWanted' },
    { $group: { _id: '$skillsWanted.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return sendSuccess(res, 200, 'Top skills fetched', {
    offered: topOffered.map(s => ({ name: s._id, count: s.count })),
    wanted:  topWanted.map(s => ({ name: s._id, count: s.count })),
  });
});