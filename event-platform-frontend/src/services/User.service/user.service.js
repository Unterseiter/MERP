import { instanceAxios } from "../axios-config";

export default class UserService {

    static apiUrl = '/api/user';
    
    static async getProfile() {
        const res = await instanceAxios.get(this.apiUrl + '/profile');
        return res.data;
    }
};