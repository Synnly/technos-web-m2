import type { PredictionWithThisNbOfVotesAndNbOfPublications } from "../../../modules/prediction/prediction.interface";

export type PredictionSectionProps = {
	predictions: PredictionWithThisNbOfVotesAndNbOfPublications[];
	usersMap: Record<string, string>;
	onPredictionClick: (id: string) => void;
};
