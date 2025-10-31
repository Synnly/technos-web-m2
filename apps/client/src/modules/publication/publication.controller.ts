import type { Toast } from "../../components/toast/Toast.interface";
import { PublicationResolver } from "./publication.resolver";

export const PublicationController = {
	async getAllPublications(token: string | null, setToast?: React.Dispatch<React.SetStateAction<Toast | null>>) {
		if (!token) {
			setToast?.({ type: "error", message: "Unauthorized" });
			return [];
		}
		return PublicationResolver.getAllPublications(token);
	},

	async getPublicationsByPredictionId(
		prediction_id: string,
		token: string | null,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			setToast?.({ type: "error", message: "Unauthorized" });
			return [];
		}
		return PublicationResolver.getPublicationsByPredictionId(prediction_id, token);
	},

	async createPublication(
		message: string,
		prediction_id: string,
		parentPublication_id: string | undefined,
		user_id: string,
		token: string | null,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) : Promise<string | undefined> {
		if (!token) {
			setToast?.({ type: "error", message: "Unauthorized" });
			return;
		}
		return PublicationResolver.createPublication(message, prediction_id, parentPublication_id, user_id, token);
	},

	async toggleLike(
		publicationId: string,
		userId: string,
		token: string | null,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			setToast?.({ type: "error", message: "Unauthorized" });
			return;
		}
		return PublicationResolver.toggleLike(publicationId, userId, token);
	},
};
