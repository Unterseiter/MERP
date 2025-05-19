const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const SubscriptionController = require('../controllers/subscriberController');


// Получение подписок/подписчиков
router.get('/:userTag', 
  authMiddleware,
  SubscriptionController.checkSubscriptionOwnership,
  SubscriptionController.getSubscriptions
);

// Создание подписки
router.post('/',
  authMiddleware,
  SubscriptionController.createSubscriber
);

// Удаление подписки
router.delete('/:userTag',
  authMiddleware,
  SubscriptionController.deleteSubscription
);

module.exports = router;