const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');

const {
  getStats,
  getGrowthData,
  getAllUsers,
  getUserDetail,
  banUser,
  unbanUser,
  changeUserRole,
  deleteUser,
  getAllSessions,
  getAllExchanges,
  getAllReviews,
  deleteReview,
  getRecentActivity,
  getTopSkills,
} = require('../controllers/adminController');

// All routes protected — admin only
router.use(protect, restrictTo('admin'));

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/stats', getStats);
router.get('/growth', getGrowthData);
router.get('/activity', getRecentActivity);
router.get('/top-skills', getTopSkills);

// ─── User Management ──────────────────────────────────────────────────────────
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

// ─── Content Management ───────────────────────────────────────────────────────
router.get('/sessions', getAllSessions);
router.get('/exchanges', getAllExchanges);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;