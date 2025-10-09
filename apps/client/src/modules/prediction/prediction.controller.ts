import PredictionResolver from "./prediction.resolver";
import type {
	PredictionFormValues,
	CreatePredictionDeps,
} from "./prediction.interface";

export const PredictionController = {
	async createPrediction(
		values: PredictionFormValues & { options: Record<string, number> },
		deps: CreatePredictionDeps = {},
	) {
		const { username, fetchPredictions, onClose, setToast, setLocalError } =
			deps;

		if (setLocalError) setLocalError(null);

		try {
			await PredictionResolver.create(values, username);

			if (setToast) setToast("Prédiction créée");
			if (fetchPredictions) await fetchPredictions();
			if (onClose) onClose();

			return { success: true };
		} catch (err: any) {
			console.error(err);
			const msg =
				err?.response?.data?.message ||
				err?.message ||
				"Erreur lors de la création";
			if (setLocalError) setLocalError(msg);
			return { success: false, error: msg };
		}
	},
};

export default PredictionController;