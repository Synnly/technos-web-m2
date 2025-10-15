import axios from "axios";
import type { Vote } from "./vote.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const VoteService = {
	async getAllVotes(token: string) {
		const resp = await axios.get<Vote[]>(`${API_URL}/vote`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return resp.data;
	},
};