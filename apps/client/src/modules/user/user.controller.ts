import type { User } from "./user.interface";
import { userResolver } from "./user.resolver";

export const userController = {
	async claimDailyReward(
		user: User,
		token: string,
		setUser: any,
		setPoints: any,
		setToast: any,
	) {
		try {
			const { updatedUser, newPoints, message } =
				await userResolver.claimDailyReward(user, token);
			setUser(updatedUser);
			setPoints(newPoints);
			setToast(message);
		} catch (err: any) {
			const msg = err?.message || "Erreur lors de la réclamation";
			setToast(msg);
		}
	},
};
