import PredictionService from "./prediction.service";
import type {
	PredictionFormValues,
	PredictionPayload,
	PredictionWithThisNbOfVotesAndNbOfPublications,
	PredictionWithThisVotesAndPublications,
} from "./prediction.interface";
import { VoteService } from "../vote/vote.service";
import { PublicationService } from "../publication/publication.service";

export const PredictionResolver = {
	async create(values: PredictionFormValues & { options: Record<string, number> }, username?: string | null) {
		const token = localStorage.getItem("token");
		if (!token) throw new Error("Utilisateur non authentifié");

		const user_id = username ? await PredictionService.fetchUserIdByUsername(username, token) : undefined;

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
	async getAllPredictions(token: string): Promise<PredictionWithThisNbOfVotesAndNbOfPublications[]> {
		const predictions = await PredictionService.getAllPredictions(token);
		const votes = await VoteService.getAllVotes(token);
		const publications = await PublicationService.getAllPublications(token);

		return predictions.map((prediction) => ({
			...prediction,
			percent: Math.round(
				(Math.max(...Object.values(prediction.options)) /
					Object.values(prediction.options).reduce((a, b) => a + b, 0)) *
					100 || 0,
			),
			mostVotedOption: Object.keys(prediction.options).reduce((a, b) =>
				prediction.options[a] > prediction.options[b] ? a : b,
			),
			nbVotes: votes.filter((vote) => vote.prediction_id === prediction._id).length,
			nbPublications: publications.filter((pub) => pub.prediction_id === prediction._id).length,
		}));
	},

	async getPredictionById(
		id: string,
		token: string,
	): Promise<PredictionWithThisVotesAndPublications | undefined> {
		const prediction = await PredictionService.getPredictionById(id, token);
		if (!prediction) return undefined;

		const votes = await VoteService.getAllVotes(token);
		const publications = await PublicationService.getAllPublications(token);

		return {
			...prediction,
			votes: votes.filter((vote) => vote.prediction_id === prediction._id),
			publications: publications.filter((pub) => pub.prediction_id === prediction._id),
		};
	},

	async getWaitingPredictions(token: string, page: string, limit: string) {
		const allPredictions = await PredictionService.getWaitingPredictions(token, page, limit);
		return allPredictions;
	},

	async validatePrediction(id: string, token: string) {
		const res = await PredictionService.updatePredictionStatus(id, token, "Valid");
		return res;
	},

	async refusePrediction(id: string, token: string) {
		const res = await PredictionService.updatePredictionStatus(id, token, "Invalid");
		return res;
	},

	async getExpiredPredictions(token: string, page: string, limit: string) {
		const allPredictions = await PredictionService.getExpiredPredictions(token, page, limit);
		return allPredictions;
	},

	async validateAPrediction(id: string, token: string, winningOption: string) {
		const res = await PredictionService.confirmPredictionResult(id, token, winningOption);
		return res;
	}
};

export default PredictionResolver;
