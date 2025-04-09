import { instanceAxios } from "../axios-config";

export default class EventService {

    static apiUrl = '/api/events';
//получения всех событий 
static async getAllRecords(filters = {}) {
    console.log("filter");
    console.log(filters);
    const params = {
      ...filters,
      limited: filters.limited || 10,
    };

    const res = await instanceAxios.get(this.apiUrl, {
      params: {
        ...params,
        start_date: filters.start_date?.toISOString(),
        end_date: filters.end_date?.toISOString(),
      },
    });
    return res.data;
  }
//получение мероприятия по id
    static async getOneRecord(id) {
        const res = await instanceAxios.get(this.apiUrl + `/${id}`);
        return res.data;
    }
//создание мероприятия
    static async createRecord(body) {
        const res = await instanceAxios.post(this.apiUrl, body);
        return res.data;
    }
//измениение мероприятия по айди
    static async updateRecord(id, body) {
        const res = await instanceAxios.put(`${this.apiUrl}/${id}`, body);
        return res.data;
    }
//удаление мероприятия
    static async removeRecord(id) {
        const res = await instanceAxios.delete(`${this.apiUrl}/${id}`);
        return res.data;
    }
};