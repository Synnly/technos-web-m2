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

	async createVote(
		amount: number,
		prediction_id: string,
		option: string,
		date: Date,
		user_id: string,
		token: string,
	) {
		const resp = await axios.post<Vote>(
			`${API_URL}/vote`,
			{
				amount,
				prediction_id,
				option,
				date,
				user_id,
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);
		return resp.data;
	},
};
