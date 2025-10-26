import type { ToastType } from "../../components/toast/Toast.interface";
import type { PublicUser, User } from "./user.interface";
import { userService } from "./user.service";

export const userResolver = {
	async claimDailyReward(user: any, token: string) {
		if (
			user.dateDerniereRecompenseQuotidienne &&
			new Date(user.dateDerniereRecompenseQuotidienne).toDateString() === new Date().toDateString()
		) {
			return {
				updatedUser: user,
				newPoints: user.points,
				message: "Récompense déjà réclamée aujourd'hui",
				type: "info" as ToastType,
			};
		}

		const updatedUser = await userService.claimDailyReward(token);

		const newPoints = updatedUser.points || 0;
		return {
			updatedUser,
			newPoints,
			message: "Récompense quotidienne réclamée ! +10 points",
			type: "success" as ToastType,
		};
	},

	async getUsers(token: string): Promise<Array<PublicUser>> {
		return Array.from(await userService.getUsers(token));
	},

	async getUserByUsername(username: string, token: string) {
		return userService.getUserByUsername(username, token);
	},

	async login(username: string, password: string) {
		return userService.login(username, password);
	},

	async register(username: string, password: string) {
		return userService.register(username, password);
	},
	async deleteUser(username: string, token: string) {
		userService.deleteUser(username, token);
	},

	async updateUser(username: string, data: Partial<User>, token: string) {
		userService.updateUser(username, data, token);
	},
};
