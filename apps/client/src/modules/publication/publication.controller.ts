import type { Toast } from "../../components/toast/Toast.interface";
import { PublicationResolver } from "./publication.resolver";

export const PublicationController = {
	async getAllPublications(
		token: string | null,
		setToast?: React.Dispatch<React.SetStateAction<Toast | null>>,
	) {
		if (!token) {
			setToast?.({ type: "error", message: "Unauthorized" });
			return [];
		}
		return PublicationResolver.getAllPublications(token);
	},
};
