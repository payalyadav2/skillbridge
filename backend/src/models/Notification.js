const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: [
      'exchange_request', 'exchange_accepted', 'exchange_rejected',
      'exchange_cancelled', 'exchange_completed',
      'new_message', 'session_scheduled', 'session_reminder',
      'session_started', 'session_cancelled',
      'review_received', 'achievement_earned',
      'skill_verified', 'profile_viewed', 'match_found',
      'system'
    ],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  // Polymorphic reference
  referenceModel: {
    type: String,
    enum: ['ExchangeRequest', 'Message', 'Session', 'Review', 'Achievement', 'User', 'Skill'],
  },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  // Deep link for frontend routing
  actionUrl: { type: String },
  // State
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  // Push notification sent?
  isPushSent: { type: Boolean, default: false },
  // Email notification sent?
  isEmailSent: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // TTL 30 days

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
