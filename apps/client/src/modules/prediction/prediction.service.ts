import axios from "axios";
import type { Prediction, PredictionPayload } from "./prediction.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const PredictionService = {
	async createPrediction(payload: PredictionPayload, token?: string) {
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		return axios.post(`${API_URL}/prediction`, payload, { headers });
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

	async getAllPredictions(token: string): Promise<Prediction[]> {
		const resp = await axios.get<Prediction[]>(`${API_URL}/prediction`, {
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

	async getWaitingPredictions(token: string, page: string, limit: string) {
		const resp = await axios.get<Prediction[]>(`${API_URL}/prediction/waiting`, {
			headers: { Authorization: `Bearer ${token}` },
			params: { page, limit },
		});
		return resp.data || [];
	},

	async updatePredictionStatus(id: string, token: string, status: "validated" | "refused") {
		const headers = { Authorization: `Bearer ${token}` };
		const resp = await axios.put<Prediction>(`${API_URL}/prediction/${id}/`, { status }, { headers });
		return resp.data;
	},

	async getExpiredPredictions(token: string, page: string, limit: string) {
		const resp = await axios.get<Prediction[]>(`${API_URL}/prediction/expired`, {
			headers: { Authorization: `Bearer ${token}` },
			params: { page, limit },
		});

		return resp.data || [];
	},

	async confirmPredictionResult(id: string, token: string, winningOption: string) {
		const headers = { Authorization: `Bearer ${token}` };
		const resp = await axios.put(`${API_URL}/prediction/${id}/validate`, { winningOption }, { headers });
		return resp.data;
	}
};

export default PredictionService;
