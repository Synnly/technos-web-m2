import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const userService = {
	async claimDailyReward(username: string, token: string) {
		const response = await axios.get(
			`${API_URL}/user/${username}/daily-reward`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);
		console.log("Je suis la réponse");
		console.log(response.data);
		return response.data;
	},
};
