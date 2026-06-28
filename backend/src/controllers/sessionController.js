const Session = require('../models/Session');
const ExchangeRequest = require('../models/ExchangeRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated, getPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');
const achievementService = require('../services/achievementService');

// ─── Create Session ───────────────────────────────────────────────────────────
exports.createSession = asyncHandler(async (req, res) => {
  const {
    exchangeRequestId, title, description, scheduledAt, duration,
    type, timezone, agendaItems, skill
  } = req.body;

  const exchange = await ExchangeRequest.findById(exchangeRequestId)
    .populate('sender receiver', 'name avatar email');

  if (!exchange) return sendError(res, 404, 'Exchange request not found');
  if (exchange.status !== 'accepted') {
    return sendError(res, 400, 'Exchange must be accepted before scheduling a session');
  }

  const isSender = exchange.sender._id.toString() === req.user._id.toString();
  if (!isSender && exchange.receiver._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not a participant of this exchange');
  }

  // Generate unique room ID for video call
  const roomId = `sb_${uuidv4().replace(/-/g, '').substring(0, 16)}`;

  const participant = isSender ? exchange.receiver : exchange.sender;

  const session = await Session.create({
    exchangeRequest: exchangeRequestId,
    host: req.user._id,
    participant: participant._id,
    title,
    description,
    skill: skill || { name: exchange.skillOffered.name },
    scheduledAt: new Date(scheduledAt),
    duration: duration || 60,
    type: type || 'video',
    timezone: timezone || 'UTC',
    agendaItems,
    roomId,
    meetingLink: `/session/${roomId}`,
  });

  // Link to exchange
  await ExchangeRequest.findByIdAndUpdate(exchangeRequestId, {
    sessionId: session._id,
  });

  // Notify participant
  await Notification.create({
    recipient: participant._id,
    sender: req.user._id,
    type: 'session_scheduled',
    title: '📅 Session Scheduled',
    body: `${req.user.name} scheduled "${title}" for ${new Date(scheduledAt).toLocaleDateString()}`,
    referenceModel: 'Session',
    referenceId: session._id,
    actionUrl: `/sessions/${session._id}`,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${participant._id}`).emit('notification', {
      type: 'session_scheduled',
      message: `Session "${title}" scheduled`,
    });
  }

  await session.populate('host participant', 'name avatar');

  return sendSuccess(res, 201, 'Session scheduled successfully!', { session });
});

// ─── Get My Sessions ──────────────────────────────────────────────────────────
exports.getMySessions = asyncHandler(async (req, res) => {
  const { status, upcoming, page = 1, limit = 10 } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = {
    $or: [{ host: req.user._id }, { participant: req.user._id }],
  };

  if (status) query.status = status;
  if (upcoming === 'true') {
    query.scheduledAt = { $gte: new Date() };
    query.status = 'scheduled';
  }

  const [sessions, total] = await Promise.all([
    Session.find(query)
      .populate('host participant', 'name avatar')
      .populate('exchangeRequest', 'skillOffered skillWanted status')
      .sort({ scheduledAt: upcoming === 'true' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Session.countDocuments(query),
  ]);

  return sendPaginated(res, 'Sessions fetched', sessions, {
    page: parseInt(page), limit: parseInt(limit), total
  });
});

// ─── Get Session by ID ────────────────────────────────────────────────────────
exports.getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('host participant', 'name avatar bio skillsOffered')
    .populate('exchangeRequest', 'skillOffered skillWanted status');

  if (!session) return sendError(res, 404, 'Session not found');

  const isParticipant =
    session.host._id.toString() === req.user._id.toString() ||
    session.participant._id.toString() === req.user._id.toString();

  if (!isParticipant) return sendError(res, 403, 'Not authorized');

  return sendSuccess(res, 200, 'Session fetched', { session });
});

// ─── Start Session ────────────────────────────────────────────────────────────
exports.startSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) return sendError(res, 404, 'Not found');

  if (session.host.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Only the host can start the session');
  }

  session.status = 'ongoing';
  session.startedAt = new Date();
  await session.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${session.participant}`).emit('session_started', {
      sessionId: session._id,
      roomId: session.roomId,
    });
  }

  return sendSuccess(res, 200, 'Session started', { session });
});

// ─── End Session ──────────────────────────────────────────────────────────────
exports.endSession = asyncHandler(async (req, res) => {
  const { recap } = req.body;
  const session = await Session.findById(req.params.id);
  if (!session) return sendError(res, 404, 'Not found');

  if (session.host.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Only the host can end the session');
  }

  session.status = 'completed';
  session.endedAt = new Date();
  session.actualDuration = Math.round(
    (session.endedAt - session.startedAt) / (1000 * 60)
  );
  if (recap) session.recap = recap;
  await session.save();

  // Increment session count for participants
  await User.updateMany(
    { _id: { $in: [session.host, session.participant] } },
    { $inc: { totalSessions: 1 } }
  );

  // Update learning progress
  await User.findByIdAndUpdate(session.participant, {
    $inc: { [`learningProgress.$[elem].sessionsCompleted`]: 1 }
  }, {
    arrayFilters: [{ 'elem.skillName': session.skill.name }],
  });

  await Promise.all([
    achievementService.checkAndAward(session.host, 'session_completed'),
    achievementService.checkAndAward(session.participant, 'session_completed'),
  ]);

  return sendSuccess(res, 200, 'Session ended', { session });
});

// ─── Cancel Session ───────────────────────────────────────────────────────────
exports.cancelSession = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const session = await Session.findById(req.params.id);
  if (!session) return sendError(res, 404, 'Not found');

  const isParticipant =
    session.host.toString() === req.user._id.toString() ||
    session.participant.toString() === req.user._id.toString();

  if (!isParticipant) return sendError(res, 403, 'Not authorized');

  session.status = 'cancelled';
  session.cancelledBy = req.user._id;
  session.cancelReason = reason;
  await session.save();

  return sendSuccess(res, 200, 'Session cancelled', { session });
});

// ─── Update Session Notes ─────────────────────────────────────────────────────
exports.updateSessionNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const session = await Session.findById(req.params.id);
  if (!session) return sendError(res, 404, 'Not found');

  const isHost = session.host.toString() === req.user._id.toString();
  const isParticipant = session.participant.toString() === req.user._id.toString();

  if (!isHost && !isParticipant) return sendError(res, 403, 'Not authorized');

  if (isHost) session.hostNotes = notes;
  else session.participantNotes = notes;

  await session.save();

  return sendSuccess(res, 200, 'Notes updated', { session });
});

// ─── Get WebRTC Room Info ─────────────────────────────────────────────────────
exports.getRoomInfo = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const session = await Session.findOne({ roomId })
    .populate('host participant', 'name avatar');

  if (!session) return sendError(res, 404, 'Room not found');

  const isParticipant =
    session.host._id.toString() === req.user._id.toString() ||
    session.participant._id.toString() === req.user._id.toString();

  if (!isParticipant) return sendError(res, 403, 'Not authorized to join this room');

  return sendSuccess(res, 200, 'Room info', {
    roomId: session.roomId,
    session: {
      id: session._id,
      title: session.title,
      host: session.host,
      participant: session.participant,
      status: session.status,
    },
  });
});
