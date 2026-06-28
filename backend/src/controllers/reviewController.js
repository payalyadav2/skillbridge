const Review = require('../models/Review');
const ExchangeRequest = require('../models/ExchangeRequest');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, sendPaginated, getPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const achievementService = require('../services/achievementService');

// ─── Create Review ────────────────────────────────────────────────────────────
exports.createReview = asyncHandler(async (req, res) => {
  const { exchangeRequestId, rating, comment, subRatings } = req.body;

  if (!exchangeRequestId || !rating) {
    return sendError(res, 400, 'Exchange request and rating are required');
  }

  const exchange = await ExchangeRequest.findById(exchangeRequestId)
    .populate('sender receiver', 'name avatar');

  if (!exchange) return sendError(res, 404, 'Exchange not found');
  if (exchange.status !== 'completed') {
    return sendError(res, 400, 'Can only review completed exchanges');
  }

  const isSender = exchange.sender._id.toString() === req.user._id.toString();
  const isReceiver = exchange.receiver._id.toString() === req.user._id.toString();

  if (!isSender && !isReceiver) {
    return sendError(res, 403, 'Not a participant of this exchange');
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({
    reviewer: req.user._id,
    exchangeRequest: exchangeRequestId,
  });

  if (existingReview) return sendError(res, 409, 'You have already reviewed this exchange');

  const reviewee = isSender ? exchange.receiver._id : exchange.sender._id;

  const review = await Review.create({
    reviewer: req.user._id,
    reviewee,
    exchangeRequest: exchangeRequestId,
    rating,
    comment,
    subRatings,
    skillExchanged: {
      offered: exchange.skillOffered.name,
      received: exchange.skillWanted.name,
    },
  });

  // Mark exchange as reviewed
  if (isSender) exchange.senderReviewed = true;
  else exchange.receiverReviewed = true;
  await exchange.save();

  // Notify reviewee
  await Notification.create({
    recipient: reviewee,
    sender: req.user._id,
    type: 'review_received',
    title: '⭐ New Review',
    body: `${req.user.name} left you a ${rating}-star review!`,
    referenceModel: 'Review',
    referenceId: review._id,
    actionUrl: `/profile/${reviewee}`,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${reviewee}`).emit('notification', {
      type: 'review_received',
      message: `${req.user.name} left you a review`,
    });
  }

  await achievementService.checkAndAward(req.user._id, 'review_given');

  await review.populate('reviewer reviewee', 'name avatar');

  return sendSuccess(res, 201, 'Review submitted successfully!', { review });
});

// ─── Get Reviews for a User ───────────────────────────────────────────────────
exports.getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const { skip } = getPagination({ page, limit });

  const [reviews, total, stats] = await Promise.all([
    Review.find({ reviewee: userId, isPublic: true, isModerationApproved: true })
      .populate('reviewer', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments({ reviewee: userId, isPublic: true }),
    Review.aggregate([
      { $match: { reviewee: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgCommunication: { $avg: '$subRatings.communication' },
          avgKnowledge: { $avg: '$subRatings.knowledge' },
          avgPunctuality: { $avg: '$subRatings.punctuality' },
          avgPatience: { $avg: '$subRatings.patience' },
          distribution: {
            $push: '$rating'
          }
        }
      }
    ]),
  ]);

  // Build rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (stats[0]?.distribution) {
    stats[0].distribution.forEach(r => distribution[r] = (distribution[r] || 0) + 1);
  }

  return sendPaginated(res, 'Reviews fetched', reviews, {
    page: parseInt(page), limit: parseInt(limit), total,
  }, {
    stats: {
      averageRating: stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0,
      totalReviews: total,
      distribution,
      subRatings: {
        communication: stats[0]?.avgCommunication ? Math.round(stats[0].avgCommunication * 10) / 10 : null,
        knowledge: stats[0]?.avgKnowledge ? Math.round(stats[0].avgKnowledge * 10) / 10 : null,
        punctuality: stats[0]?.avgPunctuality ? Math.round(stats[0].avgPunctuality * 10) / 10 : null,
        patience: stats[0]?.avgPatience ? Math.round(stats[0].avgPatience * 10) / 10 : null,
      }
    }
  });
});

// ─── Respond to Review ────────────────────────────────────────────────────────
exports.respondToReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  const review = await Review.findById(id);
  if (!review) return sendError(res, 404, 'Review not found');

  if (review.reviewee.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Not authorized');
  }

  review.response = { text: response, respondedAt: new Date() };
  await review.save();

  return sendSuccess(res, 200, 'Response added to review', { review });
});

// ─── Report Review ────────────────────────────────────────────────────────────
exports.reportReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  await Review.findByIdAndUpdate(id, {
    isReported: true,
    reportReason: reason,
  });

  return sendSuccess(res, 200, 'Review reported for moderation');
});
