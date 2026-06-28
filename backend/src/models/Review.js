const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exchangeRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExchangeRequest',
    required: true,
  },
  // Overall rating
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  // Sub-ratings
  subRatings: {
    communication: { type: Number, min: 1, max: 5 },
    knowledge: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    patience: { type: Number, min: 1, max: 5 },
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true,
  },
  skillExchanged: {
    offered: { type: String },
    received: { type: String },
  },
  isPublic: { type: Boolean, default: true },
  // Reviewer can respond
  response: {
    text: { type: String, maxlength: [500] },
    respondedAt: { type: Date },
  },
  // Moderation
  isReported: { type: Boolean, default: false },
  reportReason: { type: String },
  isModerationApproved: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
reviewSchema.index({ reviewee: 1, rating: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ exchangeRequest: 1 });
reviewSchema.index({ createdAt: -1 });

// ─── Prevent duplicate reviews ────────────────────────────────────────────────
reviewSchema.index({ reviewer: 1, exchangeRequest: 1 }, { unique: true });

// ─── Update user's average rating after save ──────────────────────────────────
reviewSchema.post('save', async function () {
  const User = mongoose.model('User');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { reviewee: this.reviewee } },
    {
      $group: {
        _id: '$reviewee',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.reviewee, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
