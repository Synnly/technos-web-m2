import type { Toast } from "../../components/toast/Toast.interface";
import { VoteResolver } from "./vote.resolver";

export const VoteController = {
	async getAllVotes(
		token: string,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
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
};
