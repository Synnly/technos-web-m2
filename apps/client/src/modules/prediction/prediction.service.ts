import axios from "axios";
import type { Prediction, PredictionPayload } from "./prediction.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const PredictionService = {
	async createPrediction(payload: PredictionPayload, token?: string) {
		return axios.post(`${API_URL}/prediction`, payload, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	},

	async fetchUserIdByUsername(username: string, token?: string): Promise<string | undefined> {
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

	async getAllValidPredictions(token: string): Promise<Prediction[]> {
		const resp = await axios.get<Prediction[]>(`${API_URL}/prediction/valid`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return resp.data || [];
	},

	async getPredictionById(id: string, token: string): Promise<Prediction | undefined> {
		try {
			const headers = { Authorization: `Bearer ${token}` };
			const resp = await axios.get<Prediction>(`${API_URL}/prediction/${id}`, { headers });
			resp.data.dateFin = new Date(resp.data.dateFin);
			return resp.data || undefined;
		} catch (error) {
			return undefined;
		}
	},

	async getTimelineData(
		predictionId: string,
		intervalMinutes: number,
		votesAsPercentage: boolean,
		fromStart: boolean,
		token: string,
	) {
		const resp = await axios.get(`${API_URL}/prediction/${predictionId}/timeline`, {
			params: {
				intervalMinutes,
				votesAsPercentage,
				fromStart,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return resp.data;
	},
};

export default PredictionService;
