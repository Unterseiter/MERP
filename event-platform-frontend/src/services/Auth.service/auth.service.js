import { instanceAxios } from "../axios-config";

export default class AuthService {

    static apiUrl = '/api';

    static async login(body) {
        const res = await instanceAxios.post(this.apiUrl + "/login", body);
        return res.data;
    }
    static async register(body) {
        const res = await instanceAxios.post(this.apiUrl + "/register", body);
        return res.data;
    }
}