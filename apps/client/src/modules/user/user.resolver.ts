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

	async login(username: string, password: string) {
		return userService.login(username, password);
	},

	async register(username: string, password: string) {
		if (password.length < 8) {
			throw new Error(
				"Le mot de passe doit contenir au moins 8 caractères",
			);
		}
		if (
			!/[A-Z]/.test(password) ||
			!/[a-z]/.test(password) ||
			!/[0-9]/.test(password) ||
			!/[!@#$%^&*(),.?":{}|<>]/.test(password)
		) {
			throw new Error(
				"Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial",
			);
		}

		return userService.register(username, password);
	},
	async deleteUser(username: string, token: string) {
		userService.deleteUser(username, token);
	},
};
