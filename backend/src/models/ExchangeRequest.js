const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Skill sender offers
  skillOffered: {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    name: { type: String, required: true },
    level: { type: String },
  },
  // Skill sender wants in return
  skillWanted: {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    name: { type: String, required: true },
    level: { type: String },
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'expired'],
    default: 'pending',
  },
  exchangeType: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'online',
  },
  proposedSchedule: {
    date: { type: Date },
    time: { type: String },
    timezone: { type: String },
  },
  // Set after acceptance
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
  },
  // Cancellation / rejection
  rejectionReason: { type: String },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: { type: Date },
  // Completion
  completedAt: { type: Date },
  senderReviewed: { type: Boolean, default: false },
  receiverReviewed: { type: Boolean, default: false },
  // Auto-expire after 7 days if pending
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
exchangeRequestSchema.index({ sender: 1, status: 1 });
exchangeRequestSchema.index({ receiver: 1, status: 1 });
exchangeRequestSchema.index({ status: 1, expiresAt: 1 });
exchangeRequestSchema.index({ createdAt: -1 });

// ─── Prevent duplicate pending requests ──────────────────────────────────────
exchangeRequestSchema.index(
  { sender: 1, receiver: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

const ExchangeRequest = mongoose.model('ExchangeRequest', exchangeRequestSchema);

module.exports = ExchangeRequest;
