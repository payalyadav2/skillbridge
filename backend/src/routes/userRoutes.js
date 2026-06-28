const express = require('express');
const router = express.Router();
const {
  getUserProfile, updateProfile, uploadAvatar,
  updateLocation, addSkillOffered, removeSkillOffered,
  addSkillWanted, removeSkillWanted, updateLearningProgress,
  searchUsers, getNearbyUsers, getMatches, getDashboardStats
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadProfile, handleCloudinaryUpload } = require('../config/cloudinary');

const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get('/search', optionalAuth, searchUsers);
router.get('/nearby', protect, getNearbyUsers);
router.get('/matches', protect, getMatches);
router.get('/dashboard', protect, getDashboardStats);
router.get('/:id', optionalAuth, getUserProfile);

router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, handleUpload(uploadProfile), handleCloudinaryUpload('profiles', [{width:500,height:500,crop:'fill',gravity:'face'}]), uploadAvatar);
router.put('/location', protect, updateLocation);

router.post('/skills/offered', protect, addSkillOffered);
router.delete('/skills/offered/:skillId', protect, removeSkillOffered);
router.post('/skills/wanted', protect, addSkillWanted);
router.delete('/skills/wanted/:skillId', protect, removeSkillWanted);
router.put('/learning-progress', protect, updateLearningProgress);

module.exports = router;
