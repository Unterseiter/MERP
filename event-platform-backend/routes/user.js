const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profil/', authMiddleware, userController.getProfile);
router.get('/', userController.getAllProfile);
router.put('/',authMiddleware, userController.updateProfile);

module.exports = router;
