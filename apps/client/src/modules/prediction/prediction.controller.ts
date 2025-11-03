import PredictionResolver from "./prediction.resolver";
import type { PredictionFormValues, CreatePredictionDeps, ValidatedPrediction } from "./prediction.interface";
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

	async getAllValidPredictions(
		token: string | null,
		page: string = "1",
		limit: string = "10",
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
			const data = await PredictionResolver.getAllValidPredictions(token, page, limit);
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

			const validatedData = data.map((prediction) => ({
				_id: prediction._id,
				title: prediction.title,
				user_id: prediction.user_id,
				dateFin: prediction.dateFin,
				description: prediction.description,
			})) as unknown as ValidatedPrediction[];			
			return validatedData;
		} catch (err: any) {
			if (setToast)
				setToast({
					message: "Erreur lors de la récupération des prédictions",
					type: "error",
				});
			return [];
		}
	},

	async getAllClosedPredictions(
		token: string | null,
		page: string = "1",
		limit: string = "10",
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
			const data = await PredictionResolver.getAllClosedPredictions(token, page, limit);
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

	async getExpiredPredictions(
		token: string | null,
		page: string,
		limit: string,
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
			const data = await PredictionResolver.getExpiredPredictions(token, page, limit);
			return data;
		} catch (err: any) {
			if (setToast)
				setToast({
					message: "Erreur lors de la récupération des prédictions expirées",
					type: "error",
				});
			return [];
		}
	},

	async validateAPrediction(
		id: string | null,
		token: string | null,
		winningOption: string,
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
			await PredictionResolver.validateAPrediction(id, token, winningOption);
			if (setToast)
				setToast({
					message: "Résultats de la prédiction confirmés",
					type: "success",
				});
			return;
		} catch (err: any) {
			if (setToast)
				setToast({
					message: "Erreur lors de la confirmation des résultats",
					type: "error",
				});
			return;
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

	async getPredictionsCount(token: string | null, setToast?: React.Dispatch<React.SetStateAction<Toast | null>>) {
		if (!token) {
			if (setToast)
				setToast({ message: "Utilisateur non authentifié", type: "error" });
			return { totalCount: 0 };
		}
		try {
			const data = await PredictionResolver.getPredictionsCount(token);
			return data;
		} catch (err: any) {
			if (setToast)
				setToast({ message: "Erreur lors de la récupération du nombre de prédictions", type: "error" });
			return { totalCount: 0 };
		}
	},
};

export default PredictionController;
