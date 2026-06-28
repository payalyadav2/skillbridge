const express = require('express');
const router = express.Router();
const {
  sendRequest, acceptRequest, rejectRequest,
  cancelRequest, completeExchange,
  getMyExchanges, getExchangeById
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyExchanges);
router.post('/', protect, sendRequest);
router.get('/:id', protect, getExchangeById);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);
router.put('/:id/cancel', protect, cancelRequest);
router.put('/:id/complete', protect, completeExchange);

module.exports = router;
