import PredictionService from "./prediction.service";
import type {
	PredictionFormValues,
	PredictionPayload,
} from "./prediction.interface";

export const PredictionResolver = {
	async create(
		values: PredictionFormValues & { options: Record<string, number> },
		username?: string | null,
	) {
		const token = localStorage.getItem("token");
		if (!token) throw new Error("Utilisateur non authentifié");

		const user_id = username
			? await PredictionService.fetchUserIdByUsername(username, token)
			: undefined;

		const payload: PredictionPayload = {
			title: values.title,
			description: values.description,
			dateFin: new Date(values.dateFin).toISOString(),
			status: "waiting",
			result: "",
			options: values.options,
		};
		if (user_id) payload.user_id = user_id;

		const res = await PredictionService.createPrediction(payload, token);
		return res.data;
	},
};

export default PredictionResolver;
