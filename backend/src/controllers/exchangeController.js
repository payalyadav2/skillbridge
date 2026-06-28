const ExchangeRequest = require('../models/ExchangeRequest');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated, getPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const achievementService = require('../services/achievementService');

// ─── Send Exchange Request ────────────────────────────────────────────────────
exports.sendRequest = asyncHandler(async (req, res) => {
  const { receiverId, skillOffered, skillWanted, message, exchangeType, proposedSchedule } = req.body;

  if (!receiverId || !skillOffered?.name || !skillWanted?.name) {
    return sendError(res, 400, 'Receiver, offered skill, and wanted skill are required');
  }

  if (receiverId === req.user._id.toString()) {
    return sendError(res, 400, 'You cannot send a request to yourself');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver || !receiver.isActive) {
    return sendError(res, 404, 'User not found');
  }

  // Check for existing pending request
  const existingRequest = await ExchangeRequest.findOne({
    sender: req.user._id,
    receiver: receiverId,
    status: 'pending',
  });

  if (existingRequest) {
    return sendError(res, 409, 'You already have a pending request with this user');
  }

  const exchangeRequest = await ExchangeRequest.create({
    sender: req.user._id,
    receiver: receiverId,
    skillOffered,
    skillWanted,
    message,
    exchangeType: exchangeType || 'online',
    proposedSchedule,
  });

  // Create notification
  await Notification.create({
    recipient: receiverId,
    sender: req.user._id,
    type: 'exchange_request',
    title: '🤝 New Exchange Request',
    body: `${req.user.name} wants to exchange ${skillOffered.name} ↔ ${skillWanted.name}`,
    referenceModel: 'ExchangeRequest',
    referenceId: exchangeRequest._id,
    actionUrl: `/exchanges/${exchangeRequest._id}`,
  });

  // Emit socket notification
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${receiverId}`).emit('notification', {
      type: 'exchange_request',
      message: `${req.user.name} sent you an exchange request`,
    });
  }

  // Send email notification (non-blocking)
  emailService.sendExchangeRequestEmail(receiver, req.user, {
    skillOffered: skillOffered.name,
    skillWanted: skillWanted.name,
    message,
  }).catch(console.warn);

  const populated = await exchangeRequest.populate('sender receiver', 'name avatar email');

  return sendSuccess(res, 201, 'Exchange request sent successfully', {
    exchangeRequest: populated
  });
});

// ─── Accept Request ───────────────────────────────────────────────────────────
exports.acceptRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exchangeRequest = await ExchangeRequest.findById(id)
    .populate('sender receiver', 'name avatar email');

  if (!exchangeRequest) return sendError(res, 404, 'Exchange request not found');
  if (exchangeRequest.receiver._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized to accept this request');
  }
  if (exchangeRequest.status !== 'pending') {
    return sendError(res, 400, `Request is already ${exchangeRequest.status}`);
  }

  // Create conversation for them to chat
  let conversation = await Conversation.findOne({
    participants: { $all: [exchangeRequest.sender._id, exchangeRequest.receiver._id] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [exchangeRequest.sender._id, exchangeRequest.receiver._id],
      exchangeRequest: exchangeRequest._id,
    });
  }

  exchangeRequest.status = 'accepted';
  exchangeRequest.conversationId = conversation._id;
  await exchangeRequest.save();

  // Notify sender
  await Notification.create({
    recipient: exchangeRequest.sender._id,
    sender: req.user._id,
    type: 'exchange_accepted',
    title: '✅ Exchange Request Accepted!',
    body: `${req.user.name} accepted your exchange request`,
    referenceModel: 'ExchangeRequest',
    referenceId: exchangeRequest._id,
    actionUrl: `/exchanges/${exchangeRequest._id}`,
  });

  // Socket notification
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${exchangeRequest.sender._id}`).emit('notification', {
      type: 'exchange_accepted',
      message: `${req.user.name} accepted your exchange request`,
    });
    io.to(`user:${exchangeRequest.sender._id}`).emit('exchange_accepted', {
      exchangeId: exchangeRequest._id,
      conversationId: conversation._id,
    });
  }

  return sendSuccess(res, 200, 'Exchange request accepted!', {
    exchangeRequest,
    conversationId: conversation._id,
  });
});

// ─── Reject Request ───────────────────────────────────────────────────────────
exports.rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const exchangeRequest = await ExchangeRequest.findById(id)
    .populate('sender', 'name');

  if (!exchangeRequest) return sendError(res, 404, 'Exchange request not found');
  if (exchangeRequest.receiver.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized');
  }
  if (exchangeRequest.status !== 'pending') {
    return sendError(res, 400, `Request is already ${exchangeRequest.status}`);
  }

  exchangeRequest.status = 'rejected';
  exchangeRequest.rejectionReason = reason;
  await exchangeRequest.save();

  await Notification.create({
    recipient: exchangeRequest.sender._id,
    sender: req.user._id,
    type: 'exchange_rejected',
    title: 'Exchange Request Update',
    body: `${req.user.name} declined your exchange request`,
    referenceModel: 'ExchangeRequest',
    referenceId: exchangeRequest._id,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${exchangeRequest.sender._id}`).emit('notification', {
      type: 'exchange_rejected',
      message: `${req.user.name} declined your request`,
    });
  }

  return sendSuccess(res, 200, 'Request declined');
});

// ─── Cancel Request ───────────────────────────────────────────────────────────
exports.cancelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exchangeRequest = await ExchangeRequest.findById(id);

  if (!exchangeRequest) return sendError(res, 404, 'Not found');
  if (exchangeRequest.sender.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Only the sender can cancel');
  }
  if (!['pending', 'accepted'].includes(exchangeRequest.status)) {
    return sendError(res, 400, 'Cannot cancel this request');
  }

  exchangeRequest.status = 'cancelled';
  exchangeRequest.cancelledBy = req.user._id;
  exchangeRequest.cancelledAt = new Date();
  await exchangeRequest.save();

  return sendSuccess(res, 200, 'Request cancelled');
});

// ─── Complete Exchange ────────────────────────────────────────────────────────
exports.completeExchange = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exchangeRequest = await ExchangeRequest.findById(id);

  if (!exchangeRequest) return sendError(res, 404, 'Not found');

  const isParticipant =
    exchangeRequest.sender.toString() === req.user._id.toString() ||
    exchangeRequest.receiver.toString() === req.user._id.toString();

  if (!isParticipant) return sendError(res, 403, 'Not authorized');
  if (exchangeRequest.status !== 'accepted') {
    return sendError(res, 400, 'Only accepted exchanges can be completed');
  }

  exchangeRequest.status = 'completed';
  exchangeRequest.completedAt = new Date();
  await exchangeRequest.save();

  // Increment exchange counts for both users
  await User.updateMany(
    { _id: { $in: [exchangeRequest.sender, exchangeRequest.receiver] } },
    { $inc: { totalExchanges: 1 } }
  );

  // Check achievements for both
  await Promise.all([
    achievementService.checkAndAward(exchangeRequest.sender, 'exchange_completed'),
    achievementService.checkAndAward(exchangeRequest.receiver, 'exchange_completed'),
  ]);

  // Notify other party
  const otherUserId = exchangeRequest.sender.toString() === req.user._id.toString()
    ? exchangeRequest.receiver
    : exchangeRequest.sender;

  await Notification.create({
    recipient: otherUserId,
    sender: req.user._id,
    type: 'exchange_completed',
    title: '🎉 Exchange Completed!',
    body: `${req.user.name} marked the exchange as complete. Leave a review!`,
    referenceModel: 'ExchangeRequest',
    referenceId: exchangeRequest._id,
    actionUrl: `/reviews/write/${exchangeRequest._id}`,
  });

  return sendSuccess(res, 200, 'Exchange marked as completed!', { exchangeRequest });
});

// ─── Get My Exchanges ─────────────────────────────────────────────────────────
exports.getMyExchanges = asyncHandler(async (req, res) => {
  const { status, role, page = 1, limit = 10 } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = {
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
  };

  if (status) query.status = status;
  if (role === 'sender') delete query.$or, query.sender = req.user._id;
  if (role === 'receiver') delete query.$or, query.receiver = req.user._id;

  const [exchanges, total] = await Promise.all([
    ExchangeRequest.find(query)
      .populate('sender receiver', 'name avatar experienceLevel averageRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ExchangeRequest.countDocuments(query),
  ]);

  return sendPaginated(res, 'Exchanges fetched', exchanges, {
    page: parseInt(page), limit: parseInt(limit), total
  });
});

// ─── Get Exchange Details ─────────────────────────────────────────────────────
exports.getExchangeById = asyncHandler(async (req, res) => {
  const exchange = await ExchangeRequest.findById(req.params.id)
    .populate('sender receiver', 'name avatar bio skillsOffered experienceLevel averageRating')
    .populate('conversationId')
    .populate('sessionId');

  if (!exchange) return sendError(res, 404, 'Exchange not found');

  const isParticipant =
    exchange.sender._id.toString() === req.user._id.toString() ||
    exchange.receiver._id.toString() === req.user._id.toString();

  if (!isParticipant) return sendError(res, 403, 'Not authorized');

  return sendSuccess(res, 200, 'Exchange fetched', { exchange });
});
