const express = require('express');
const router = express.Router();
const {
  createSkill, getSkills, getSkillById,
  updateSkill, deleteSkill, getMySkills, getCategories
} = require('../controllers/skillController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/mine', protect, getMySkills);
router.get('/', optionalAuth, getSkills);
router.post('/', protect, createSkill);
router.get('/:id', optionalAuth, getSkillById);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

module.exports = router;
