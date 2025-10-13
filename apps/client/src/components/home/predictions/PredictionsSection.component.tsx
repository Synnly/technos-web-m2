import PredictionCard from "../../predictions/PredictionCard";
import type { PredictionSectionProps } from "../types/PredictionSection.type";
import { useNavigate } from "react-router-dom";

export default function PredictionsSection({
	predictions,
	usersMap,
	onPredictionClick,
}: PredictionSectionProps) {
	const navigate = useNavigate();
	const firstThree = (predictions || [])
		.reverse()
		.slice(predictions.length - 3, predictions.length)
		.reverse();

	const navigateAllPredictions = () => {
		navigate("/predictions");
	};
	return (
		<div className="my-8">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-bold text-white mb-6">
					Prédictions
				</h1>
				<span
					className="text-gray-400 cursor-pointer underline underline-offset-4"
					onClick={navigateAllPredictions}
				>
					Tout voir
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-white cursor-pointer">
				{firstThree.map((prediction) => (
					<PredictionCard
						key={prediction._id}
						id={prediction._id}
						title={prediction.title}
						author={usersMap[prediction.user_id]}
						votes={prediction.nbVotes}
						comments={prediction.nbPublications}
						percentLabel={"0"}
						percent={10}
						endsIn={prediction.dateFin.toString()}
						onClick={onPredictionClick}
					/>
				))}
			</div>
		</div>
	);
}
