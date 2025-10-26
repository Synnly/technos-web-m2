import PredictionResolver from "./prediction.resolver";
import type { PredictionFormValues, CreatePredictionDeps } from "./prediction.interface";
import type React from "react";
import type { Toast } from "../../components/toast/Toast.interface";

export const PredictionController = {
	async createPrediction(
		token: string | null,
		values: PredictionFormValues & { options: Record<string, number> },
		deps: CreatePredictionDeps = {},
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			if (setToast)
				setToast({
					message: "Utilisateur non authentifié",
					type: "error",
				});
			return { success: false, error: "Utilisateur non authentifié" };
		}

		const { fetchPredictions, onClose, setLocalError } = deps;
		if (setLocalError) setLocalError(null);

		try {
			await PredictionResolver.create(values, token);
			if (setToast) setToast({ message: "Prédiction créée", type: "success" });
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

	async getTimelineData(
		predictionId: string,
		intervalMinutes: number,
		votesAsPercentage: boolean,
		fromStart: boolean,
		token: string,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		try {
			const data = await PredictionResolver.getTimelineData(
				predictionId,
				intervalMinutes,
				votesAsPercentage,
				fromStart,
				token,
			);
			return data;
		} catch (err: any) {
			if (setToast)
				setToast({
					message: "Erreur lors de la récupération de la timeline des votes",
					type: "error",
				});
		}
	},
};

export default PredictionController;
