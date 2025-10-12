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

	async login(
		username: string,
		password: string,
		setError?: React.Dispatch<React.SetStateAction<string | null>>,
	) {
		try {
			return await userResolver.login(username, password);
		} catch (err: any) {
			const msg =
				err?.response?.data?.message || "Erreur lors de la connexion";
			if (setError) setError(msg);
			return null;
		}
	},

	async register(
		username: string,
		password: string,
		setError?: React.Dispatch<React.SetStateAction<string | null>>,
	) {
		console.log("Registering user:", username.trim() === "");
		if (username.trim() === "") {
			if (setError)
				setError("Le nom d'utilisateur ne peut pas être vide");
			return null;
		}
		if (password.trim() === "") {
			if (setError) setError("Le mot de passe ne peut pas être vide");
			return null;
		}
		try {
			return await userResolver.register(
				username.trim(),
				password.trim(),
			);
		} catch (err: any) {
			const msg =
				err?.response?.data?.message || "Erreur lors de l'inscription";
			if (setError) setError(msg);
			return null;
		}
	},
};
