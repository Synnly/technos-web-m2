import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const CosmeticService = {
	async getAll(token: string) {
		const headers = { Authorization: `Bearer ${token}` };
		const res = await axios.get(`${API_URL}/cosmetic`, { headers });
		return res.data || [];
	},
	async getUser(username: string, token: string) {
		const headers = { Authorization: `Bearer ${token}` };
		const res = await axios.get(`${API_URL}/user/${username}`, { headers });
		return res.data;
	},

	async applyCosmetic(username: string, current: (string | null)[], token: string) {
		const headers = { Authorization: `Bearer ${token}` };
		const res = await axios.put(
			`${API_URL}/user/${username}`,
			{
				username: username,
				currentCosmetic: current,
			},
			{ headers },
		);
		return res.data;
	},
};
