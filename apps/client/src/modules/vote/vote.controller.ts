import type { Toast } from "../../components/toast/Toast.interface";
import { VoteResolver } from "./vote.resolver";

export const VoteController = {
	async getAllVotes(token: string, setToast?: React.Dispatch<React.SetStateAction<Toast | null>>) {
		if (!token) {
			if (setToast)
				setToast({
					message: "Utilisateur non authentifié",
					type: "error",
				});
			return [];
		}
		return VoteResolver.getAllVotes(token);
	},

	async createVote(
		amount: number,
		prediction_id: string,
		option: string,
		user_id: string,
		token: string,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			if (setToast)
				setToast({
					message: "Utilisateur non authentifié",
					type: "error",
				});
			return null;
		}
		return VoteResolver.createVote(amount, prediction_id, option, user_id, token);
	},
};
