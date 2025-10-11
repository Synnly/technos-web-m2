import axios from "axios";
import type { Prediction, PredictionPayload } from "./prediction.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const PredictionService = {
	async createPrediction(payload: PredictionPayload, token?: string) {
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		return axios.post(`${API_URL}/prediction`, payload, { headers });
	},

	async fetchUserIdByUsername(
		username: string,
		token?: string,
	): Promise<string | undefined> {
		if (!username) return undefined;
		try {
			const headers = token ? { Authorization: `Bearer ${token}` } : {};
			const res = await axios.get(`${API_URL}/user/${username}`, {
				headers,
			});
			return res.data?._id;
		} catch (err) {
			return undefined;
		}
	},

	async getAllPredictions(token: string): Promise<Prediction[]> {
		const resp = await axios.get<Prediction[]>(`${API_URL}/prediction`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return resp.data || [];
	},
};

export default PredictionService;
