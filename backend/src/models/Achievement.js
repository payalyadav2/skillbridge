const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // emoji or icon name
  badge: { type: String }, // image URL
  category: {
    type: String,
    enum: ['exchange', 'teaching', 'learning', 'social', 'milestone', 'special'],
    required: true,
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze',
  },
  pointsReward: { type: Number, default: 50 },
  // Unlock criteria
  criteria: {
    type: {
      type: String,
      enum: [
        'exchanges_completed', 'sessions_completed', 'reviews_given',
        'rating_threshold', 'skills_offered', 'skills_learned',
        'streak_days', 'profile_complete', 'first_exchange', 'special'
      ],
    },
    threshold: { type: Number },
    description: { type: String },
  },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
