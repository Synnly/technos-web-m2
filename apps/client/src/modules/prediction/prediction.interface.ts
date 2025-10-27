import type { Publication } from "../publication/publication.interface";
import type { Vote } from "../vote/vote.interface";

export interface PredictionFormValues {
	title: string;
	description?: string;
	dateFin: string;
}

export interface PredictionPayload {
	title: string;
	description?: string;
	dateFin: Date;
	status?: string;
	result?: string;
	options: Record<string, number>;
}

export interface CreatePredictionDeps {
	username?: string | null;
	fetchPredictions?: () => Promise<void>;
	onClose?: () => void;
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
	pronostics_ia?: Record<string, number>;
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

export interface TimelineDataPoint {
	date: Date;
	options: { [option: string]: number };
}
