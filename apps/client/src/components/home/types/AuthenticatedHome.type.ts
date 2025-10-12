import type { PredictionWithThisNbOfVotesAndNbOfPublications } from "../../../modules/prediction/prediction.interface";

export type AuthenticatedHomeProps = {
	user: any;
	username?: string | null;
	token: string | null;
	sidebarCollapsed: boolean;
	setSidebarCollapsed: (v: boolean) => void;
	form: any;
	open: boolean;
	setOpen: (v: boolean) => void;
	toast: any;
	setToast: (t: any) => void;
	predictions: PredictionWithThisNbOfVotesAndNbOfPublications[];
	usersMap: Record<string, string>;
	handlePredictionClick: (id: string) => void;
	fetchAllPredictions: () => Promise<void>;
	setError: (m: string | null) => void;
};
