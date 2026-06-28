const express = require('express');
const router = express.Router();
const {
  createSession, getMySessions, getSessionById,
  startSession, endSession, cancelSession,
  updateSessionNotes, getRoomInfo
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMySessions);
router.post('/', protect, createSession);
router.get('/room/:roomId', protect, getRoomInfo);
router.get('/:id', protect, getSessionById);
router.put('/:id/start', protect, startSession);
router.put('/:id/end', protect, endSession);
router.put('/:id/cancel', protect, cancelSession);
router.put('/:id/notes', protect, updateSessionNotes);

module.exports = router;
