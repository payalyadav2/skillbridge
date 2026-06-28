const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters'],
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'video', 'audio', 'system', 'call'],
    default: 'text',
  },
  attachment: {
    url: { type: String },
    publicId: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    thumbnail: { type: String },
  },
  // System message meta (e.g. "Exchange accepted")
  systemMeta: {
    action: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
  },
  // Read receipts per participant
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now },
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  // Reply to another message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  // Reactions
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: { type: String },
  }],
}, {
  timestamps: true,
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ conversation: 1, isDeleted: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
