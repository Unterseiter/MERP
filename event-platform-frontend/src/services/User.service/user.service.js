import { instanceAxios } from "../axios-config";

export default class UserService {
    static apiUrl = '/api/user';

    // Получение профиля текущего пользователя
    static async getProfile() {
        const res = await instanceAxios.get(`${this.apiUrl}/profile`);
        return res.data;
    }

    // Получение списка пользователей с пагинацией и сортировкой
    static async getAllUsers(page = 1, sortDirection = 'ASC') {
        const res = await instanceAxios.get(this.apiUrl, {
            params: {
                page,
                sortDirection // было sort
            }
        });
        return res.data;
    }

    // Обновление профиля пользователя
    static async updateProfile(userData) {
        const res = await instanceAxios.put(this.apiUrl, userData);
        return res.data;
    }

    // Получение пользователя по тегу
    static async getUserByTag(tagUser) {
        const res = await instanceAxios.get(`${this.apiUrl}/${tagUser}`);
        console.log("res.data");
        console.log(res.data.data);
        return res.data.data;
    }

    // Удаление профиля (если endpoint доступен)
    static async deleteProfile(userId) {
        const res = await instanceAxios.delete(`${this.apiUrl}/${userId}`);
        return res.data;
    }
}