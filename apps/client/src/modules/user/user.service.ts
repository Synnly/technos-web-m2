import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const userService = {
	async claimDailyReward(token: string) {
		const response = await axios.get(`${API_URL}/user/daily-reward`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return response.data;
	},

	async getUsers(token: string) {
		const res = await axios.get(`${API_URL}/user/public`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data;
	},

	async getUserByUsername(username: string, token: string) {
		const res = await axios.get(`${API_URL}/user/${username}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data;
	},

	async login(username: string, password: string) {
		const response = await axios.post(`${API_URL}/user/login`, {
			username,
			password,
		});
		return response.data.token.token;
	},

	async register(username: string, password: string) {
		const response = await axios.post(`${API_URL}/user`, {
			username,
			motDePasse: password,
		});
		return response.data;
	},

	async deleteUser(username: string, token: string) {
		await axios.delete(`${API_URL}/user/${username}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},

	async updateUser(username: string, data: Partial<any>, token: string) {
		await axios.put(`${API_URL}/user/${username}`, data, {
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};
