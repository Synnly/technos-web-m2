import type { Publication } from "../publication/publication.interface";
import type { Vote } from "../vote/vote.interface";

export interface PredictionFormValues {
	title: string;
	description?: string;
	dateFin: string;
}

export type ValidatedPrediction = {
	_id: string;
	title: string;
	user_id: string;
	dateFin: string | Date;
};

export interface PredictionPayload {
	title: string;
	description?: string;
	dateFin: string;
	status?: string;
	result?: string;
	options: Record<string, number>;
	user_id?: string;
}

export interface CreatePredictionDeps {
	username?: string | null;
	fetchPredictions?: () => Promise<void>;
	onClose?: () => void;
	setToast?: (msg: string) => void;
	setLocalError?: (msg: string | null) => void;
}
export type PredictionStatus = "waiting" | "valid" | "invalid";

export interface Prediction {
	_id: string;
	title: string;
	description: string;
	status: PredictionStatus;
	dateFin: Date;
	options: Record<string, number>;
	user_id: string;
	result: string;
}

export interface PredictionWithThisNbOfVotesAndNbOfPublications extends Prediction {
	nbVotes: number;
	nbPublications: number;
	percent: number;
	mostVotedOption: string;
}

export interface PredictionWithThisVotesAndPublications extends Prediction {
	votes: Vote[];
	publications: Publication[];
}
