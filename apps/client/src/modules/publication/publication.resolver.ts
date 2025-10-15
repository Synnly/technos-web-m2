import { PublicationService } from "./publication.service";

export const PublicationResolver = {
	async getAllPublications(token: string) {
		return PublicationService.getAllPublications(token);
	},
};
