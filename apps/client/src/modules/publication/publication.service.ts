import axios from "axios";
import type { Publication } from "./publication.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const PublicationService = {
	async getAllPublications(token: string) {
		const resp = await axios.get<Publication[]>(`${API_URL}/publication`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return resp.data;
	},

	async createPublication(
		message: string,
		prediction_id: string,
		parentPublication_id: string | undefined,
		user_id: string,
		token: string,
	) {
		const resp = await axios.post<Publication>(
			`${API_URL}/publication`,
			{
				message: message,
				datePublication: new Date(),
				prediction_id: prediction_id,
				parentPublication_id: parentPublication_id,
				user_id: user_id,
				likes: [],
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);
		return resp.data;
	},

	async toggleLike(publicationId: string, userId: string, token: string) {
		const resp = await axios.put<Publication>(
			`${API_URL}/publication/${publicationId}/toggle-like/${userId}`,
			{},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);
		return resp.data;
	},
};
