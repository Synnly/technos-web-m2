import PredictionResolver from "./prediction.resolver";
import type { PredictionFormValues, CreatePredictionDeps } from "./prediction.interface";
import type React from "react";
import type { Toast } from "../../components/toast/Toast.interface";

export const PredictionController = {
	async createPrediction(
		values: PredictionFormValues & { options: Record<string, number> },
		deps: CreatePredictionDeps = {},
	) {
		const { username, fetchPredictions, onClose, setToast, setLocalError } = deps;

		if (setLocalError) setLocalError(null);

		try {
			await PredictionResolver.create(values, username);

			if (setToast) setToast("Prédiction créée");
			if (fetchPredictions) await fetchPredictions();
			if (onClose) onClose();

			return { success: true };
		} catch (err: any) {
			console.error(err);
			const msg = err?.response?.data?.message || err?.message || "Erreur lors de la création";
			if (setLocalError) setLocalError(msg);
			return { success: false, error: msg };
		}
	},
	async getAllPredictions(token: string | null, setToast?: React.Dispatch<React.SetStateAction<Toast | null>>) {
		if (!token) {
			if (setToast)
				setToast({
					message: "Utilisateur non authentifié",
					type: "error",
				});
			return [];
		}
		try {
			const data = await PredictionResolver.getAllPredictions(token);
			return data;
		} catch (err: any) {
			if (setToast)
				setToast({
					message: "Erreur lors de la récupération des prédictions",
					type: "error",
				});
			return [];
		}
	},

	async getWaitingPredictions(
		page: string,
		limit: string,
		token: string | null,
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
		try {
			const data = await PredictionResolver.getWaitingPredictions(token, page, limit);
			return data;
		} catch (err: any) {
			if (setToast)
				setToast({
					message: "Erreur lors de la récupération des prédictions",
					type: "error",
				});
			return [];
		}
	},

	async getPredictionById(
		id: string,
		token: string | null,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			if (setToast)
				setToast({
					message: "Utilisateur non authentifié",
					type: "error",
				});
			return undefined;
		}
		try {
			const data = await PredictionResolver.getPredictionById(id, token);
			return data;
		} catch (err: any) {
			if (setToast)
				setToast({
					message: "Erreur lors de la récupération de la prédiction",
					type: "error",
				});
			return undefined;
		}
	},

	async updatePredictionStatus(
		id: string | null,
		action: "validate" | "refuse",
		token: string,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			if (setToast)
				setToast({
					message: "Utilisateur non authentifié",
					type: "error",
				});
			return;
		}
		if (!id) {
			if (setToast)
				setToast({
					message: "Identifiant de prédiction manquant",
					type: "error",
				});
			return;
		}

		try {
			if (action === "validate") {
				await PredictionResolver.validatePrediction(id, token);
				if (setToast)
					setToast({
						message: "Prédiction validée",
						type: "success",
					});
			} else {
				await PredictionResolver.refusePrediction(id, token);
				if (setToast)
					setToast({
						message: "Prédiction refusée",
						type: "success",
					});
			}
		} catch (err: any) {
			if (setToast)
				setToast({
					message:
						action === "validate"
							? "Erreur lors de la validation de la prédiction"
							: "Erreur lors du refus de la prédiction",
					type: "error",
				});
		}
	},
};

export default PredictionController;
