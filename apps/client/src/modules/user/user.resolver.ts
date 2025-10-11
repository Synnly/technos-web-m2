import type { ToastType } from "../../components/toast/Toast.interface";
import { userService } from "./user.service";

export const userResolver = {
	async claimDailyReward(user: any, token: string) {
		if (
			user.dateDerniereRecompenseQuotidienne &&
			new Date(user.dateDerniereRecompenseQuotidienne).toDateString() ===
				new Date().toDateString()
		) {
			return {
				updatedUser: user,
				newPoints: user.points,
				message: "Récompense déjà réclamée aujourd'hui",
				type: "info" as ToastType,
			};
		}

		const updatedUser = await userService.claimDailyReward(
			user.username,
			token,
		);

		const newPoints = updatedUser.points || 0;
		return {
			updatedUser,
			newPoints,
			message: "Récompense quotidienne réclamée ! +10 points",
			type: "success" as ToastType,
		};
	},

	async getUsersMap(token: string) {
		return userService.getUsersMap(token);
	},

	async getUserByUsername(username: string, token: string) {
		return userService.getUserByUsername(username, token);
	},
};
