import { PublicationService } from "./publication.service";

export const PublicationResolver = {
	async getAllPublications(token: string) {
		const publications = await PublicationService.getAllPublications(token);
		return publications.map((pub) => ({
			...pub,
			parentPublication_id: pub.parentPublication_id === "undefined" ? undefined : pub.parentPublication_id,
			datePublication: new Date(pub.datePublication),
		}));
	},

	async getPublicationsByPredictionId(prediction_id: string, token: string) {
		const allPublications = await PublicationService.getAllPublications(token);
		const filteredPublications = allPublications.filter(
			(publication) => publication.prediction_id === prediction_id,
		);
		return filteredPublications.map((pub) => ({
			...pub,
			parentPublication_id: pub.parentPublication_id === "undefined" ? undefined : pub.parentPublication_id,
			datePublication: new Date(pub.datePublication),
		}));
	},

	async createPublication(
		message: string,
		prediction_id: string,
		parentPublication_id: string | undefined,
		user_id: string,
		token: string,
	) : Promise<string | undefined> {
		return PublicationService.createPublication(message, prediction_id, parentPublication_id, user_id, token);
	},

	async toggleLike(publicationId: string, userId: string, token: string) {
		return PublicationService.toggleLike(publicationId, userId, token);
	},
};
