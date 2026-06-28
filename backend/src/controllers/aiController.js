const aiService = require('../services/aiService');
const matchingService = require('../services/matchingService');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Get Skill Recommendations ────────────────────────────────────────────────
exports.getSkillRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const recommendations = await aiService.getSkillRecommendations(user);
  return sendSuccess(res, 200, 'Skill recommendations generated', recommendations);
});

// ─── Skill Gap Analysis ───────────────────────────────────────────────────────
exports.analyzeSkillGap = asyncHandler(async (req, res) => {
  const { targetRole } = req.body;
  if (!targetRole) return sendError(res, 400, 'Target role is required');

  const user = await User.findById(req.user._id);
  const analysis = await aiService.analyzeSkillGap(user, targetRole);
  return sendSuccess(res, 200, 'Skill gap analysis complete', analysis);
});

// ─── Generate Learning Roadmap ────────────────────────────────────────────────
exports.generateRoadmap = asyncHandler(async (req, res) => {
  const { skillName, currentLevel, targetLevel, timeframe } = req.body;

  if (!skillName || !currentLevel || !targetLevel) {
    return sendError(res, 400, 'Skill name, current level, and target level are required');
  }

  const roadmap = await aiService.generateLearningRoadmap(
    skillName, currentLevel, targetLevel, timeframe
  );
  return sendSuccess(res, 200, 'Learning roadmap generated', roadmap);
});

// ─── AI Chat Assistant ────────────────────────────────────────────────────────
exports.chatWithAI = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return sendError(res, 400, 'Messages array is required');
  }

  const user = await User.findById(req.user._id);
  const userContext = {
    name: user.name,
    skillsOffered: user.skillsOffered?.map(s => s.name),
    skillsWanted:  user.skillsWanted?.map(s => s.name),
    experienceLevel: user.experienceLevel,
  };

  const response = await aiService.chat(messages, userContext);
  return sendSuccess(res, 200, 'AI response', { response });
});

// ─── Get AI Matches ───────────────────────────────────────────────────────────
// FIX: removed broken dynamic import + duplicate require — use single top-level require
exports.getAIMatches = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { matches: potentialMatches } = await matchingService.findMatches(user, { limit: 20 });

  if (!potentialMatches || potentialMatches.length === 0) {
    return sendSuccess(res, 200, 'AI-powered matches', { matches: [] });
  }

  const aiMatches = await aiService.findBestMatches(user, potentialMatches);

  const matchedUsers = aiMatches.matches
    .map(match => {
      const userData = potentialMatches.find(u => u._id.toString() === match.id);
      if (!userData) return null;
      return { ...userData._doc, aiScore: match.score, aiReason: match.reason };
    })
    .filter(Boolean)
    .sort((a, b) => b.aiScore - a.aiScore);

  return sendSuccess(res, 200, 'AI-powered matches', { matches: matchedUsers });
});

// ─── Generate Skill Verification Questions ────────────────────────────────────
exports.generateVerificationQuestions = asyncHandler(async (req, res) => {
  const { skillName, level } = req.body;

  if (!skillName || !level) {
    return sendError(res, 400, 'Skill name and level are required');
  }

  const questions = await aiService.generateVerificationQuestions(skillName, level);
  return sendSuccess(res, 200, 'Verification questions generated', questions);
});