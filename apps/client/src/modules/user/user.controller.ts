import type { Toast } from "../../components/toast/Toast.interface";
import type { User } from "./user.interface";
import { userResolver } from "./user.resolver";

export const userController = {
	async claimDailyReward(
		user: User,
		token: string,
		setUser: any,
		setPoints: any,
		setToast : React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		try {
			const { updatedUser, newPoints, message, type } =
				await userResolver.claimDailyReward(user, token);
			setUser(updatedUser);
			setPoints(newPoints);
			setToast({message, type});
		} catch (err: any) {
			const msg = err?.message || "Erreur lors de la réclamation";
			setToast({message : msg,  type : "error"});
		}
	},
};
