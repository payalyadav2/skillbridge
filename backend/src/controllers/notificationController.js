const Notification = require('../models/Notification');
const { sendSuccess, sendError, sendPaginated, getPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Get My Notifications ─────────────────────────────────────────────────────
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  return sendPaginated(res, 'Notifications fetched', notifications, {
    page: parseInt(page), limit: parseInt(limit), total
  });
});

// ─── Mark as Read ─────────────────────────────────────────────────────────────
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { isRead: true, readAt: new Date() }
  );

  return sendSuccess(res, 200, 'Notification marked as read');
});

// ─── Mark All as Read ─────────────────────────────────────────────────────────
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return sendSuccess(res, 200, 'All notifications marked as read');
});

// ─── Delete Notification ──────────────────────────────────────────────────────
exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  return sendSuccess(res, 200, 'Notification deleted');
});

// ─── Get Unread Count ─────────────────────────────────────────────────────────
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  return sendSuccess(res, 200, 'Unread count', { count });
});
