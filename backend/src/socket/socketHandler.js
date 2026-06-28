const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication token required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name avatar isActive isBanned');
      if (!user || !user.isActive || user.isBanned) return next(new Error('Unauthorized'));
      socket.userId = decoded.id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    socket.join(`user:${userId}`);
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date(), socketId: socket.id });
    socket.broadcast.emit('user_online', { userId, timestamp: new Date() });

    socket.on('join_conversations', async () => {
      try {
        const conversations = await Conversation.find({ participants: userId, isActive: true }).select('_id');
        conversations.forEach(conv => socket.join(`conversation:${conv._id}`));
      } catch (err) { console.error(err.message); }
    });

    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
        if (conversation) socket.join(`conversation:${conversationId}`);
      } catch (err) { /* invalid id or db error - silently ignore */ }
    });
    socket.on('leave_conversation', (conversationId) => socket.leave(`conversation:${conversationId}`));

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'text', replyTo } = data;
        const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
        if (!conversation) return;

        const message = await Message.create({ conversation: conversationId, sender: userId, content, type, replyTo });
        await message.populate('sender', 'name avatar');
        if (replyTo) await message.populate('replyTo', 'content sender');

        const otherParticipants = conversation.participants.filter(p => p.toString() !== userId);
        const unreadUpdate = {};
        otherParticipants.forEach(p => { unreadUpdate[`unreadCount.${p}`] = (conversation.unreadCount?.get(p.toString()) || 0) + 1; });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id, lastMessageAt: new Date(),
          lastMessageText: content?.substring(0, 100) || 'Attachment', ...unreadUpdate,
        });

        io.to(`conversation:${conversationId}`).emit('new_message', { conversationId, message: message.toObject() });

        otherParticipants.forEach(participantId => {
          if (!onlineUsers.has(participantId.toString())) {
            io.to(`user:${participantId}`).emit('message_notification', {
              conversationId, senderName: socket.user.name,
              preview: content?.substring(0, 60) || 'Sent an attachment',
            });
          }
        });
      } catch (err) {
        console.error('Send message error:', err.message);
        socket.emit('message_error', { error: err.message });
      }
    });

    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId, userName: socket.user.name, conversationId,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', { userId, conversationId });
    });

    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, 'readBy.user': { $ne: userId } },
          { $addToSet: { readBy: { user: userId, readAt: new Date() } } }
        );
        await Conversation.findByIdAndUpdate(conversationId, { $unset: { [`unreadCount.${userId}`]: '' } });
        socket.to(`conversation:${conversationId}`).emit('messages_read', { conversationId, readBy: userId });
      } catch (err) { console.error(err.message); }
    });

    // ── WebRTC Signaling ──────────────────────────────────────────────────
    socket.on('join_room', ({ roomId }) => {
      socket.join(`room:${roomId}`);
      const clientsInRoom = io.sockets.adapter.rooms.get(`room:${roomId}`);
      const numClients = clientsInRoom ? clientsInRoom.size : 0;
      if (numClients === 1) {
        socket.emit('room_created', { roomId });
      } else if (numClients === 2) {
        socket.to(`room:${roomId}`).emit('peer_joined', {
          peerId: socket.id, userId,
          user: { name: socket.user.name, avatar: socket.user.avatar },
        });
        socket.emit('room_joined', { roomId });
      } else {
        socket.emit('room_full', { roomId });
      }
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('peer_left', { peerId: socket.id, userId });
    });

    socket.on('webrtc_offer', ({ roomId, offer, targetSocketId }) => {
      const payload = { offer, fromSocketId: socket.id, fromUser: { userId, name: socket.user.name, avatar: socket.user.avatar } };
      if (targetSocketId) io.to(targetSocketId).emit('webrtc_offer', payload);
      else socket.to(`room:${roomId}`).emit('webrtc_offer', payload);
    });

    socket.on('webrtc_answer', ({ answer, targetSocketId, roomId }) => {
      const payload = { answer, fromSocketId: socket.id };
      if (targetSocketId) io.to(targetSocketId).emit('webrtc_answer', payload);
      else socket.to(`room:${roomId}`).emit('webrtc_answer', payload);
    });

    socket.on('webrtc_ice_candidate', ({ candidate, targetSocketId, roomId }) => {
      const payload = { candidate, fromSocketId: socket.id };
      if (targetSocketId) io.to(targetSocketId).emit('webrtc_ice_candidate', payload);
      else socket.to(`room:${roomId}`).emit('webrtc_ice_candidate', payload);
    });

    socket.on('toggle_audio', ({ roomId, enabled }) => {
      socket.to(`room:${roomId}`).emit('peer_audio_toggle', { peerId: socket.id, userId, enabled });
    });

    socket.on('toggle_video', ({ roomId, enabled }) => {
      socket.to(`room:${roomId}`).emit('peer_video_toggle', { peerId: socket.id, userId, enabled });
    });

    socket.on('end_call', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('call_ended', { peerId: socket.id, userId });
      socket.leave(`room:${roomId}`);
    });

    socket.on('screen_share_start', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('peer_screen_share', { peerId: socket.id, sharing: true });
    });

    socket.on('screen_share_stop', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('peer_screen_share', { peerId: socket.id, sharing: false });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.user?.name}`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          socket.broadcast.emit('user_offline', { userId, lastSeen: new Date() });
        }
      }
    });
  });

  return io;
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { initializeSocket, getOnlineUsers };