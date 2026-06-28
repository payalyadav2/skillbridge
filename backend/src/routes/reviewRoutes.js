const express = require('express');
const router = express.Router();
const {
  createReview, getUserReviews,
  respondToReview, reportReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.put('/:id/respond', protect, respondToReview);
router.post('/:id/report', protect, reportReview);

module.exports = router;
