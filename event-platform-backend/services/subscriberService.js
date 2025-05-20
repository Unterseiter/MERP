// Сервис для работы с пользователями (Subscriber)
const { Subscriber, User } = require('../models');

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
    type = 'subscriptions' // 'subscriptions'(подписки) или 'subscribers'(подписчики)
  }) {
    try {
      const { Op } = require('sequelize');
      const limit = 10; // Фиксированный лимит

      // Валидация типа запроса
      if (!['subscriptions', 'subscribers'].includes(type)) {
        throw new Error('Invalid type parameter');
      }

      // Проверка существования пользователя
      const user = await this.models.User.findOne({
        where: { tag_name: userTag },
        attributes: ['tag_name']
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Настройка условий запроса
      const where = {};
      const include = [];
      let searchField;

      if (type === 'subscriptions') {
        where.subscriber_tag = userTag;
        include.push({
          model: this.models.User,
          as: 'SubscribedUser', // Те, на кого подписан пользователь
          attributes: ['tag_name', 'name', 'city'],
          where: {}
        });
        searchField = 'SubscribedUser';
      } else {
        where.subscribed_tag = userTag;
        include.push({
          model: this.models.User,
          as: 'SubscriberUser', // Те, кто подписан на пользователя
          attributes: ['tag_name', 'name', 'city'],
          where: {}
        });
        searchField = 'SubscriberUser';
      }

      // Добавляем поиск если есть search
      if (search) {
        include[0].where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { tag_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const result = await this.models.Subscriber.findAndCountAll({
        where,
        include,
        limit,
        offset: (page - 1) * limit,
        order: [[searchField, 'name', 'ASC']],
        distinct: true
      });

      return {
        total: result.count,
        page: parseInt(page),
        totalPages: Math.ceil(result.count / limit),
        data: result.rows.map(item => item[searchField])
      };
    } catch (error) {
      throw new Error(`Failed to get ${type}: ${error.message}`);
    }
  },

  // Создание подписки
  async createSubscription(subscriberTag, subscribedTag) {
    const t = await this.models.sequelize.transaction();

    try {
      // Проверка на самоподписку
      if (subscriberTag === subscribedTag) {
        throw new Error('Cannot subscribe to yourself');
      }

      // Поиск пользователей с блокировкой
      const [subscriber, subscribed] = await Promise.all([
        this.models.User.findOne({
          where: { tag_name: subscriberTag },
          transaction: t,
          lock: t.LOCK.UPDATE
        }),
        this.models.User.findOne({
          where: { tag_name: subscribedTag },
          transaction: t,
          lock: t.LOCK.UPDATE
        })
      ]);

      if (!subscriber || !subscribed) {
        throw new Error('One or both users not found');
      }

      // Проверка существующей подписки
      const existing = await this.models.Subscriber.findOne({
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
      const newSubscription = await this.models.Subscriber.create({
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
    const t = await this.models.sequelize.transaction();

    try {
      // Поиск подписки с блокировкой
      const subscription = await this.models.Subscriber.findOne({
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
