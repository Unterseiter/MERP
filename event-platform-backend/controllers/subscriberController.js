const subscriptionService = require('../services/subscriberService');

const subscriberController = {
    // Middleware для проверки прав доступа   
    async checkSubscriptionOwnership(req, res, next) {
        try {
            const { subscriberTag } = req.params;
            const currentUser = req.user.tag_name; // Предполагается, что пользователь аутентифицирован

            if (subscriberTag !== currentUser) {
                return res.status(403).json({ error: 'Forbidden: You can only manage your own subscriptions' });
            }
            next();
        } catch (error) {
            next(error);
        }
    },
    // Создание подписки
    async createSubscriber(req, res) {
        try {
            const currentUser = req.user.tag_name; // Аутентифицированный пользователь
            const { subscribedTag } = req.body;

            console.log( currentUser);
            console.log( subscribedTag);

            if (!subscribedTag) {
                return res.status(400).json({ error: 'subscribedTag is required' });
            }

            const result = await subscriptionService.createSubscription(
                currentUser,
                subscribedTag
            );

            res.status(201).json({
                message: 'Subscription created',
                data: result
            });
        } catch (error) {
            const statusMap = {
                'User not found': 404,
                'Subscription already exists': 409,
                'Cannot subscribe to yourself': 422
            };

            res.status(statusMap[error.message] || 500).json({
                error: error.message
            });
        }
    },
    // Удаление подписки
    async deleteSubscription(req, res) {
        try {
            const currentUser = req.user.tag_name;
            const { subscribedTag } = req.params;

            const result = await subscriptionService.deleteSubscription(
                currentUser,
                subscribedTag
            );

            res.status(200).json({
                message: 'Subscription deleted successfully'
            });
        } catch (error) {
            const statusMap = {
                'Subscription not found': 404,
                'User not found': 404
            };

            res.status(statusMap[error.message] || 500).json({
                error: error.message
            });
        }
    },

    // Получение подписок/подписчиков
    async getSubscriptions(req, res) {
        try {
            const tag_name  = req.user.tag_name;
            const { type = 'subscriptions', page = 1, search = '' } = req.query;

            const result = await subscriptionService.getSubscriptions({
                userTag : tag_name,
                type:type,
                page:parseInt(page),
                search:search
        });

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = subscriberController;