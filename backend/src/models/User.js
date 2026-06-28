const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillOfferedSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate',
  },
  description: { type: String, maxlength: 500 },
  isVerified: { type: Boolean, default: false },
  verificationDoc: { type: String },
  yearsOfExperience: { type: Number, min: 0, max: 50 },
}, { _id: true });

const skillWantedSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, trim: true },
  currentLevel: {
    type: String,
    enum: ['none', 'beginner', 'intermediate', 'advanced'],
    default: 'none',
  },
  targetLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  },
}, { _id: true });

const achievementSchema = new mongoose.Schema({
  achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
  earnedAt: { type: Date, default: Date.now },
}, { _id: false });

const learningProgressSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  progressPercent: { type: Number, min: 0, max: 100, default: 0 },
  sessionsCompleted: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  notes: { type: String },
}, { _id: true });

const userSchema = new mongoose.Schema({
  // ─── Core ────────────────────────────────────────────────────────────────
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [60, 'Name cannot exceed 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },

  // ─── Profile ─────────────────────────────────────────────────────────────
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    default: '',
  },
  headline: {
    type: String,
    maxlength: [120, 'Headline cannot exceed 120 characters'],
    default: '',
  },
  experienceLevel: {
    type: String,
    enum: ['student', 'beginner', 'intermediate', 'advanced', 'expert', 'professional'],
    default: 'beginner',
  },
  website: { type: String, trim: true },
  github: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  twitter: { type: String, trim: true },

  // ─── Skills ──────────────────────────────────────────────────────────────
  skillsOffered: [skillOfferedSchema],
  skillsWanted: [skillWantedSchema],
  learningProgress: [learningProgressSchema],

  // ─── Location ────────────────────────────────────────────────────────────
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    displayAddress: { type: String },
  },

  // ─── Auth ────────────────────────────────────────────────────────────────
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  refreshToken: { type: String, select: false },

  // ─── Status ──────────────────────────────────────────────────────────────
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },

  // ─── Ratings ─────────────────────────────────────────────────────────────
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalExchanges: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },

  // ─── Preferences ─────────────────────────────────────────────────────────
  preferences: {
    exchangeType: {
      type: String,
      enum: ['online', 'in-person', 'both'],
      default: 'both',
    },
    maxDistance: { type: Number, default: 50 }, // km
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      chat: { type: Boolean, default: true },
    },
    isProfilePublic: { type: Boolean, default: true },
    showLocation: { type: Boolean, default: true },
  },

  // ─── Achievements ────────────────────────────────────────────────────────
  achievements: [achievementSchema],
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },

  // ─── Socket ──────────────────────────────────────────────────────────────
  socketId: { type: String, select: false },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'skillsOffered.name': 'text', 'skillsWanted.name': 'text', name: 'text', bio: 'text' });
userSchema.index({ isOnline: 1, lastSeen: -1 });
userSchema.index({ averageRating: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('profileCompleteness').get(function () {
  let score = 0;
  if (this.name) score += 20;
  if (this.bio) score += 20;
  if (this.avatar) score += 15;
  if (this.skillsOffered?.length > 0) score += 20;
  if (this.skillsWanted?.length > 0) score += 15;
  if (this.location?.city) score += 10;
  return Math.min(score, 100);
});

// ─── Pre-save hook ────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.refreshToken;
  delete obj.socketId;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;