import PredictionService from "./prediction.service";
import type {
	PredictionFormValues,
	PredictionPayload,
	PredictionWithThisNbOfVotesAndNbOfPublications,
} from "./prediction.interface";
import { VoteService } from "../vote/vote.service";
import { PublicationService } from "../publication/publication.service";

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
	async getAllPredictions(token: string) : Promise<PredictionWithThisNbOfVotesAndNbOfPublications[]> {
		const predictions = await PredictionService.getAllPredictions(token);
		const votes = await VoteService.getAllVotes(token);
		const publications = await PublicationService.getAllPublications(token);

		return predictions.map(prediction => ({
			...prediction,
			nbVotes: votes.filter(vote => vote.prediction_id === prediction._id).length,
			nbPublications: publications.filter(pub => pub.prediction_id === prediction._id).length,
		}));
	},
};

export default PredictionResolver;
