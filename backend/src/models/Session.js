const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  exchangeRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExchangeRequest',
    required: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: [200],
  },
  description: { type: String, maxlength: [1000] },
  skill: {
    name: { type: String, required: true },
    direction: {
      type: String,
      enum: ['host-teaches', 'participant-teaches', 'both'],
      default: 'host-teaches',
    },
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Session date is required'],
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60,
    min: 15,
    max: 480,
  },
  timezone: { type: String, default: 'UTC' },
  type: {
    type: String,
    enum: ['video', 'in-person', 'phone'],
    default: 'video',
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  // WebRTC / Video Call
  roomId: { type: String, unique: true, sparse: true },
  meetingLink: { type: String },
  // Actual session tracking
  startedAt: { type: Date },
  endedAt: { type: Date },
  actualDuration: { type: Number }, // in minutes
  // Notes
  agendaItems: [{ type: String }],
  hostNotes: { type: String, maxlength: [2000] },
  participantNotes: { type: String, maxlength: [2000] },
  sharedResources: [{
    title: { type: String },
    url: { type: String },
    type: { type: String, enum: ['link', 'file', 'video'] },
  }],
  // Reminders
  reminderSent: { type: Boolean, default: false },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelReason: { type: String },
  // Recap
  recap: {
    summary: { type: String },
    topicsCovers: [{ type: String }],
    nextSteps: [{ type: String }],
    resourcesShared: [{ type: String }],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
sessionSchema.index({ host: 1, scheduledAt: -1 });
sessionSchema.index({ participant: 1, scheduledAt: -1 });
sessionSchema.index({ exchangeRequest: 1 });
sessionSchema.index({ scheduledAt: 1, status: 1 });
sessionSchema.index({ roomId: 1 });

// ─── Virtual: isUpcoming ──────────────────────────────────────────────────────
sessionSchema.virtual('isUpcoming').get(function () {
  return this.scheduledAt > new Date() && this.status === 'scheduled';
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
