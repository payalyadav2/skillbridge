const express = require('express');
const router = express.Router();
const {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage, deleteMessage, uploadChatFile
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { uploadChatFile: uploadChatFileMiddleware } = require('../config/cloudinary');

const handleChatUpload = (req, res, next) => {
  uploadChatFileMiddleware(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get('/conversations', protect, getConversations);
router.get('/conversations/:userId', protect, getOrCreateConversation);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.delete('/messages/:messageId', protect, deleteMessage);
router.post('/upload', protect, handleChatUpload, uploadChatFile);

module.exports = router;
