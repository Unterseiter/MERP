const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const SubscriptionController = require('../controllers/subscriberController');


// Получение подписок/подписчиков
router.get('/', 
  authMiddleware,
  SubscriptionController.getSubscriptions
);

// Создание подписки
router.post('/',
  authMiddleware,
  SubscriptionController.createSubscriber
);

// Удаление подписки
router.delete('/:subscribedTag',
  authMiddleware,
  SubscriptionController.deleteSubscription
);

module.exports = router;