import type { Toast } from "../../components/toast/Toast.interface";
import { CosmeticResolver } from "./cosmetic.resolver";

export const CosmeticController = {
	async getUserCosmetics(
		CosmeticOwned: string[] | any[],
		token: string | null,
		setToast?: (t: Toast | null) => void,
	) {
		if (!token) {
			setToast?.({
				type: "error",
				message: "Utilisateur non authentifié",
			});
			return [];
		}

		try {
			const cosmetics = await CosmeticResolver.getAll(token);

			const ownedCosmetics = cosmetics.filter((c: any) =>
				CosmeticOwned.some((id) => String(id) === String(c._id)),
			);

			return ownedCosmetics;
		} catch (err: any) {
			console.error(err);
			setToast?.({
				type: "error",
				message:
					err?.response?.data?.message ||
					"Erreur lors du chargement des cosmétiques",
			});
			return [];
		}
	},

	async applyCosmetic(
		username: string,
		id: string,
		token: string | null,
		allCosmetics: any[],
		applied: string[],
		setApplied: (arr: string[]) => void,
		setError: (msg: string | null) => void,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		console.log("On m'appel", token, username, id);
		if (!token) {
			setToast?.({
				type: "error",
				message: "Utilisateur non authentifié",
			});
			return { success: false, error: "not_authenticated" };
		}

		setError(null);
		try {
			const cos = allCosmetics.find((c) => String(c._id) === id);
			const slot = cos?.type?.toLowerCase().includes("color") ? 0 : 1;

			const current = [...applied];
			current[slot] = id;

			setApplied(current);
			localStorage.setItem("appliedCosmetics", JSON.stringify(current));

			const updatedUser = await CosmeticResolver.apply(
				username,
				current,
				token,
			);
			const arr = CosmeticResolver.normalize(
				updatedUser?.currentCosmetic,
			);

			setApplied(arr);
			localStorage.setItem("appliedCosmetics", JSON.stringify(arr));

			setToast?.({
				type: "success",
				message: "Cosmétique appliqué avec succès",
			});

			return { success: true, applied: arr };
		} catch (err: any) {
			console.error(err);
			const msg =
				err?.response?.data?.message ||
				"Erreur lors de l'application du cosmétique";
			setError(msg);
			setToast?.({ type: "error", message: msg });
			return { success: false, error: msg };
		}
	},
};

export default CosmeticController;
