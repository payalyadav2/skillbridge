const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated, getPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Get All Conversations ────────────────────────────────────────────────────
exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true,
  })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('lastMessage')
    .populate('exchangeRequest', 'status skillOffered skillWanted')
    .sort({ lastMessageAt: -1 });

  // Add unread count for current user
  const enriched = conversations.map(conv => {
    const obj = conv.toObject();
    obj.unreadCount = conv.unreadCount?.get(req.user._id.toString()) || 0;
    return obj;
  });

  return sendSuccess(res, 200, 'Conversations fetched', { conversations: enriched });
});

// ─── Get or Create Conversation ───────────────────────────────────────────────
exports.getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    return sendError(res, 400, 'Cannot create conversation with yourself');
  }

  const otherUser = await User.findById(userId);
  if (!otherUser) return sendError(res, 404, 'User not found');

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, userId] },
    isGroup: false,
  }).populate('participants', 'name avatar isOnline lastSeen');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, userId],
    });
    conversation = await conversation.populate('participants', 'name avatar isOnline lastSeen');
  }

  return sendSuccess(res, 200, 'Conversation ready', { conversation });
});

// ─── Get Messages in Conversation ─────────────────────────────────────────────
exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 30 } = req.query;
  const { skip } = getPagination({ page, limit });

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return sendError(res, 404, 'Conversation not found');

  const isParticipant = conversation.participants.includes(req.user._id);
  if (!isParticipant) return sendError(res, 403, 'Not a participant of this conversation');

  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversationId, isDeleted: false })
      .populate('sender', 'name avatar')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Message.countDocuments({ conversation: conversationId, isDeleted: false }),
  ]);

  // Mark as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      'readBy.user': { $ne: req.user._id },
      isDeleted: false,
    },
    {
      $addToSet: {
        readBy: { user: req.user._id, readAt: new Date() }
      }
    }
  );

  // Reset unread count
  await Conversation.findByIdAndUpdate(conversationId, {
    $unset: { [`unreadCount.${req.user._id}`]: '' }
  });

  return sendPaginated(res, 'Messages fetched', messages.reverse(), {
    page: parseInt(page), limit: parseInt(limit), total
  });
});

// ─── Send Message (REST - Socket preferred) ───────────────────────────────────
exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, type = 'text', replyTo } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return sendError(res, 404, 'Conversation not found');

  const isParticipant = conversation.participants.some(
    p => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) return sendError(res, 403, 'Not authorized');

  if (!content && !req.file) return sendError(res, 400, 'Message content is required');

  const messageData = {
    conversation: conversationId,
    sender: req.user._id,
    content,
    type,
    replyTo,
  };

  if (req.file) {
    messageData.type = 'file';
    messageData.attachment = {
      url: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };
  }

  const message = await Message.create(messageData);
  await message.populate('sender', 'name avatar');

  // Update conversation
  const otherParticipants = conversation.participants.filter(
    p => p.toString() !== req.user._id.toString()
  );

  const unreadUpdate = {};
  otherParticipants.forEach(p => {
    unreadUpdate[`unreadCount.${p}`] = (conversation.unreadCount?.get(p.toString()) || 0) + 1;
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
    lastMessageText: content?.substring(0, 100) || '📎 File',
    ...unreadUpdate,
  });

  // Emit via socket
  const io = req.app.get('io');
  if (io) {
    conversation.participants.forEach(participantId => {
      io.to(`user:${participantId}`).emit('new_message', {
        conversationId,
        message,
      });
    });
  }

  return sendSuccess(res, 201, 'Message sent', { message });
});

// ─── Delete Message ───────────────────────────────────────────────────────────
exports.deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) return sendError(res, 404, 'Message not found');

  if (message.sender.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Can only delete your own messages');
  }

  message.isDeleted = true;
  message.content = 'This message was deleted';
  message.deletedAt = new Date();
  await message.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`conversation:${message.conversation}`).emit('message_deleted', {
      messageId,
      conversationId: message.conversation,
    });
  }

  return sendSuccess(res, 200, 'Message deleted');
});

// ─── Upload File in Chat ──────────────────────────────────────────────────────
exports.uploadChatFile = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 400, 'No file provided');

  return sendSuccess(res, 200, 'File uploaded', {
    url: req.file.path,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
  });
});
