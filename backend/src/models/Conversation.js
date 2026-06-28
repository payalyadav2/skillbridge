const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  exchangeRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExchangeRequest',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  lastMessageAt: { type: Date, default: Date.now },
  lastMessageText: { type: String, default: '' },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  isActive: { type: Boolean, default: true },
  // For group conversations (future)
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  groupAvatar: { type: String },
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ exchangeRequest: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
