import type { Toast } from "../../components/toast/Toast.interface";
import type { User } from "./user.interface";
import { userResolver } from "./user.resolver";

export const userController = {
	async claimDailyReward(
		user: User,
		token: string,
		setUser: any,
		setPoints: any,
		setToast: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		try {
			const { updatedUser, newPoints, message, type } =
				await userResolver.claimDailyReward(user, token);
			setUser(updatedUser);
			setPoints(newPoints);
			setToast({ message, type });
		} catch (err: any) {
			const msg = err?.message || "Erreur lors de la réclamation";
			setToast({ message: msg, type: "error" });
		}
	},

	async getAllUsers(
		token: string | null,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			if (setToast)
				setToast({
					message: "Utilisateur non authentifié",
					type: "error",
				});
			return {};
		}
		try {
			return await userResolver.getUsersMap(token);
		} catch (err: any) {
			const msg = "Erreur lors de la récupération des utilisateurs";
			if (setToast) setToast({ message: msg, type: "error" });
			return {};
		}
	},

	async getUserByUsername(
		username: string,
		token: string | null,
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
		try {
			return await userResolver.getUserByUsername(username, token);
		} catch (err: any) {
			if (setToast) {
				const msg = "Erreur lors de la récupération de l'utilisateur";
				setToast({ message: msg, type: "error" });
			}
		}
	},
};
