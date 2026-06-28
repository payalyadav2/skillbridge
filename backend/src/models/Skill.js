const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Skill title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technology', 'Design', 'Music', 'Language', 'Cooking',
      'Fitness', 'Art', 'Business', 'Writing', 'Photography',
      'Video & Film', 'Crafts', 'Sports', 'Academia', 'Finance',
      'Marketing', 'Teaching', 'Other'
    ],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['offered', 'wanted'],
    required: true,
  },
  exchangePreference: {
    type: String,
    enum: ['online', 'in-person', 'both'],
    default: 'both',
  },
  duration: {
    type: String,
    enum: ['1-hour', '2-hours', 'half-day', 'full-day', 'weekly', 'monthly', 'flexible'],
    default: 'flexible',
  },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  interestedCount: { type: Number, default: 0 },
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
  },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
skillSchema.index({ title: 'text', description: 'text', tags: 'text' });
skillSchema.index({ category: 1, level: 1 });
skillSchema.index({ owner: 1 });
skillSchema.index({ type: 1, isActive: 1 });
skillSchema.index({ averageRating: -1 });
skillSchema.index({ createdAt: -1 });

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
