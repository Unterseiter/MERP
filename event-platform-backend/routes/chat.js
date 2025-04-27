const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController')

router.get('/:RequestId', authMiddleware, chatController.getMessages);
module.exports = router;
