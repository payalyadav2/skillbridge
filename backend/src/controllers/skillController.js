const Skill = require('../models/Skill');
const { sendSuccess, sendError, sendPaginated, getPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Create Skill Listing ─────────────────────────────────────────────────────
exports.createSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.create({ ...req.body, owner: req.user._id });
  await skill.populate('owner', 'name avatar experienceLevel averageRating');
  return sendSuccess(res, 201, 'Skill listing created', { skill });
});

// ─── Get All Skills ───────────────────────────────────────────────────────────
exports.getSkills = asyncHandler(async (req, res) => {
  const {
    q, category, level, type, exchangePreference,
    page = 1, limit = 12, sort = '-createdAt'
  } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = { isActive: true };

  if (q) query.$text = { $search: q };
  if (category) query.category = category;
  if (level) query.level = level;
  if (type) query.type = type;
  if (exchangePreference) query.exchangePreference = exchangePreference;

  const [skills, total] = await Promise.all([
    Skill.find(query)
      .populate('owner', 'name avatar experienceLevel averageRating location isOnline')
      .sort(q ? { score: { $meta: 'textScore' } } : sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Skill.countDocuments(query),
  ]);

  return sendPaginated(res, 'Skills fetched', skills, {
    page: parseInt(page), limit: parseInt(limit), total
  });
});

// ─── Get Skill by ID ──────────────────────────────────────────────────────────
exports.getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate('owner', 'name avatar bio experienceLevel averageRating totalExchanges skillsOffered isOnline location');

  if (!skill) return sendError(res, 404, 'Skill not found');

  return sendSuccess(res, 200, 'Skill fetched', { skill });
});

// ─── Update Skill ─────────────────────────────────────────────────────────────
exports.updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id, owner: req.user._id });
  if (!skill) return sendError(res, 404, 'Skill not found or not authorized');

  const allowedUpdates = ['title', 'description', 'category', 'subcategory', 'tags', 'level', 'exchangePreference', 'duration', 'isActive'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) skill[field] = req.body[field];
  });

  await skill.save();
  return sendSuccess(res, 200, 'Skill updated', { skill });
});

// ─── Delete Skill ─────────────────────────────────────────────────────────────
exports.deleteSkill = asyncHandler(async (req, res) => {
  await Skill.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  return sendSuccess(res, 200, 'Skill deleted');
});

// ─── Get My Skills ────────────────────────────────────────────────────────────
exports.getMySkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({ owner: req.user._id })
    .sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Your skills', { skills, count: skills.length });
});

// ─── Get Skill Categories ─────────────────────────────────────────────────────
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Skill.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return sendSuccess(res, 200, 'Categories', { categories });
});
