import type { Cosmetic } from "../../../modules/cosmetic/cosmetic.interface";
import type { PredictionWithThisNbOfVotesAndNbOfPublications } from "../../../modules/prediction/prediction.interface";
import type { PublicUser } from "../../../modules/user/user.interface";
import PredictionCard from "../../predictions/PredictionCard";
import { useNavigate } from "react-router-dom";

interface PredictionSectionProps {
	predictions: PredictionWithThisNbOfVotesAndNbOfPublications[];
	users: Array<PublicUser>;
	onPredictionClick: (id: string) => void;
	cosmetics: Cosmetic[];
}

const PredictionsSection: React.FC<PredictionSectionProps> = ({
	predictions,
	users,
	onPredictionClick,
	cosmetics,
}: PredictionSectionProps) => {
	const navigate = useNavigate();

	const navigateAllPredictions = () => {
		navigate("/predictions");
	};
	return (
		<div className="my-8">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-bold text-white mb-6">Prédictions</h1>
				<span
					className="text-gray-400 cursor-pointer underline underline-offset-4"
					onClick={navigateAllPredictions}
				>
					Tout voir
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-white cursor-pointer">
				{predictions.map((prediction) => (
					<PredictionCard
						key={prediction._id}
						id={prediction._id}
						title={prediction.title}
						author={users.find((user) => user._id === (prediction.user_id as any))}
						votes={prediction.nbVotes}
						comments={prediction.nbPublications}
						percent={prediction.percent}
						mostVotedOption={prediction.mostVotedOption}
						endsIn={prediction.dateFin.toString()}
						onClick={onPredictionClick}
						status={prediction.status}
						result={prediction.result}
						cosmetics={cosmetics.filter((cosmetic) =>
							users
								.find((user) => user._id === (prediction.user_id as any))
								?.currentCosmetic.includes(cosmetic._id),
						)}
					/>
				))}
			</div>
		</div>
	);
};

export default PredictionsSection;
