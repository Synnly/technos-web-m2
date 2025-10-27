import type { Toast } from "../../components/toast/Toast.interface";
import type { Cosmetic } from "./cosmetic.interface";
import { CosmeticResolver } from "./cosmetic.resolver";

export const CosmeticController = {
	async getAllCosmetics(token: string | null, setToast?: (t: Toast | null) => void): Promise<Cosmetic[]> {
		if (!token) {
			setToast?.({
				type: "error",
				message: "Utilisateur non authentifié",
			});
			return [];
		}

		try {
			const cosmetics = await CosmeticResolver.getAll(token);
			return cosmetics;
		} catch (err: any) {
			setToast?.({
				type: "error",
				message: err?.response?.data?.message || "Erreur lors du chargement des cosmétiques",
			});
			return [];
		}
	},

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
				message: err?.response?.data?.message || "Erreur lors du chargement des cosmétiques",
			});
			return [];
		}
	},

	async applyCosmetic(
		username: string,
		cosmeticId: string,
		token: string | null,
		allCosmetics: any[],
		applied: (string | null)[],
		setApplied: (arr: (string | null)[]) => void,
		setError: (msg: string | null) => void,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			setToast?.({
				type: "error",
				message: "Utilisateur non authentifié",
			});
			return { success: false, error: "not_authenticated" };
		}

		setError(null);
		try {
			const cos = allCosmetics.find((c) => String(c._id) === cosmeticId);
			const slot = cos?.type?.toLowerCase().includes("color") ? 0 : 1;

			const current = [...applied];
			current[slot] = cosmeticId;

			await CosmeticResolver.apply(username, current, token);
			setApplied(current);

			setToast?.({
				type: "success",
				message: "Cosmétique appliqué avec succès",
			});

			return { success: true, applied: current };
		} catch (err: any) {
			console.error(err);
			const msg = err?.response?.data?.message || "Erreur lors de l'application du cosmétique";
			setError(msg);
			setToast?.({ type: "error", message: msg });
			return { success: false, error: msg };
		}
	},
};

export default CosmeticController;
