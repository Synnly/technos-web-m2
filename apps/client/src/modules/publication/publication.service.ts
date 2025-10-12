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
};
