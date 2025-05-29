const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, userController.getProfile);
router.get('/', userController.getAllProfile);
router.put('/',authMiddleware, userController.updateProfile);
router.get('/:tag_user', authMiddleware, userController.getUserByTagController)

module.exports = router;
