const express = require('express');
const router = express.Router();
const {
  getAllAchievements, seedAchievements, getLeaderboard
} = require('../controllers/achievementController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, getAllAchievements);
router.get('/leaderboard', getLeaderboard);
router.post('/seed', protect, restrictTo('admin'), seedAchievements);

module.exports = router;
