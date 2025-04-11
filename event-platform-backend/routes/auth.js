const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: 'Это защищенный маршрут', user: req.user });
  });
module.exports = router;
