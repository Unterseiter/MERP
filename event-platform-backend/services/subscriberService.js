// Сервис для работы с пользователями (Subscriber)
const { Subscriber, User, sequelize } = require('../models');

const subscriberService = {
  constructor() {
    this.models = {
      Subscriber: Subscriber,
      User: User
    };
  },

  // Получение подписок с пагинацией и фильтрами
  async getSubscriptions({
    userTag,
    page = 1,
    search = '',
    type = 'subscriptions'
  }) {
    try {
      const { Op } = require('sequelize');
      const limit = 10;

      // Валидация типа запроса
      if (!['subscriptions', 'subscribers'].includes(type)) {
        throw new Error('Invalid type parameter');
      }

      // Проверка существования пользователя
      const user = await User.findOne({
        where: { tag_name: userTag }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Конфигурация запроса
      const where = {};
      const include = [{
        model: User,
        attributes: ['tag_name', 'name', 'city'],
        where: {} // Инициализируем пустой where для связанной модели
      }];

      // Определение условий для разных типов запросов
      if (type === 'subscriptions') {
        where.subscriber_tag = userTag;
        include[0].as = 'SubscribedUser';
      } else {
        where.subscribed_tag = userTag;
        include[0].as = 'SubscriberUser';
      }

      // Добавляем условия поиска
      if (search.trim()) {
        include[0].where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { tag_name: { [Op.like]: `%${search}%` } }
        ];
      }

      const result = await Subscriber.findAndCountAll({
        where,
        include,
        limit,
        offset: (page - 1) * limit,
        order: [[include[0].as, 'name', 'ASC']],
        distinct: true
      });

      return {
        total: result.count,
        page: parseInt(page),
        totalPages: Math.ceil(result.count / limit),
        data: result.rows.map(item => item[include[0].as])
      };
    } catch (error) {
      throw new Error(`Failed to get ${type}: ${error.message}`);
    }
  },

  // Создание подписки
  async createSubscription(subscriberTag, subscribedTag) {
    const t = await sequelize.transaction();

    try {
      // Проверка на самоподписку
      if (subscriberTag === subscribedTag) {
        throw new Error('Cannot subscribe to yourself');
      }

      // Поиск пользователей с блокировкой
      const [subscriber, subscribed] = await Promise.all([
        User.findOne({
          where: { tag_name: subscriberTag },
          transaction: t,
          lock: t.LOCK.UPDATE
        }),
        User.findOne({
          where: { tag_name: subscribedTag },
          transaction: t,
          lock: t.LOCK.UPDATE
        })
      ]);

      if (!subscriber || !subscribed) {
        throw new Error('One or both users not found');
      }

      // Проверка существующей подписки
      const existing = await Subscriber.findOne({
        where: {
          subscriber_tag: subscriberTag,
          subscribed_tag: subscribedTag
        },
        transaction: t
      });

      if (existing) {
        throw new Error('Subscription already exists');
      }

      // Создание подписки
      const newSubscription = await Subscriber.create({
        subscriber_tag: subscriberTag,
        subscribed_tag: subscribedTag
      }, { transaction: t });

      await t.commit();
      return newSubscription;

    } catch (error) {
      await t.rollback();
      throw new Error(`Subscription failed: ${error.message}`);
    }
  },

  // Удаление подписки (только для инициатора)
  async deleteSubscription(subscriberTag, subscribedTag) {
    const t = await sequelize.transaction();

    try {
      // Поиск подписки с блокировкой
      const subscription = await Subscriber.findOne({
        where: {
          subscriber_tag: subscriberTag,
          subscribed_tag: subscribedTag
        },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Удаление подписки
      await subscription.destroy({ transaction: t });
      await t.commit();

      return { success: true };

    } catch (error) {
      await t.rollback();
      throw new Error(`Unsubscription failed: ${error.message}`);
    }
  }
};

module.exports = subscriberService;
