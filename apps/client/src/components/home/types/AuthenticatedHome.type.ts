import type { PredictionWithThisNbOfVotesAndNbOfPublications } from "../../../modules/prediction/prediction.interface";
import type { User, PublicUser } from "../../../modules/user/user.interface";

export type AuthenticatedHomeProps = {
	user: User;
	users: PublicUser[];
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
	handlePredictionClick: (id: string) => void;
	fetchAllPredictions: () => Promise<void>;
	setError: (m: string | null) => void;
	setPoints: (points: number) => void;
	setUser: (user: User) => void;
};
