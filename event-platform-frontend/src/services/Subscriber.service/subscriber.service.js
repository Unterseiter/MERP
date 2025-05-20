import { instanceAxios } from "../axios-config";

export default class SubscriptionService {
  static apiUrl = '/api/subscriptions';

  // Получение подписок/подписчиков
  static async getSubscriptions(type = 'subscriptions', page = 1, search = '') {
    const params = {
      type,
      page,
      search
    };

    const res = await instanceAxios.get(`${this.apiUrl}`, { params });
    return res.data;
  }

  // Создание новой подписки
  static async createSubscription(subscribedTag) {
    const res = await instanceAxios.post(this.apiUrl, { subscribedTag });
    return res.data;
  }

  // Удаление подписки
  static async deleteSubscription(subscribedTag) {
    const res = await instanceAxios.delete(`${this.apiUrl}/${subscribedTag}`);
    return res.data;
  }
}