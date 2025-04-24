import { instanceAxios } from "../axios-config";

export default class EventService {
    static apiUrl = '/api/events';
  
    static async getAllRecords(filters = {}) {
      console.log('Filters:', filters);
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
  
    static async getUserRecords() {
      // Если нужно, реализуйте, например:
      const res = await instanceAxios.get(`${this.apiUrl}/user`);
      return res.data;
    }
  
    static async getOneRecord(id) {
      const res = await instanceAxios.get(`${this.apiUrl}/${id}`);
      return res.data;
    }
  
    static async createRecord(body, file = null) {
      const formData = new FormData();
      for (const key in body) {
        formData.append(key, body[key]);
      }
      if (file) {
        formData.append('photo', file);
      }
  
      const res = await instanceAxios.post(this.apiUrl, formData);
      return res.data;
    }
  
    static async updateRecord(id, body, file = null) {
      const formData = new FormData();
      for (const key in body) {
        formData.append(key, body[key]);
      }
      if (file) {
        formData.append('photo', file);
      }
  
      const res = await instanceAxios.put(`${this.apiUrl}/${id}`, formData);
      return res.data;
    }
  
    static async removeRecord(id) {
      const res = await instanceAxios.delete(`${this.apiUrl}/${id}`);
      return res.data;
    }
  }