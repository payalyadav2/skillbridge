const express = require('express');
const router = express.Router();
const {
  getSkillRecommendations, analyzeSkillGap,
  generateRoadmap, chatWithAI, getAIMatches,
  generateVerificationQuestions
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(aiLimiter);

router.get('/recommendations', getSkillRecommendations);
router.post('/gap-analysis', analyzeSkillGap);
router.post('/roadmap', generateRoadmap);
router.post('/chat', chatWithAI);
router.get('/matches', getAIMatches);
router.post('/verify-questions', generateVerificationQuestions);

module.exports = router;
