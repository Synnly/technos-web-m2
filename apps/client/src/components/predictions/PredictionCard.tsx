import React from "react";
import { Vote, MessageSquare, Trophy } from "lucide-react";
import type { PredictionCardProps } from "./PredictionCard.interface";
import TimeUntilEnd from "../time-until-end/TimeUntilEnd";
import Username from "../cosmetics/Username";

const PredictionCard: React.FC<PredictionCardProps> = ({
	id,
	title,
	author,
	votes = "0",
	comments = "0",
	percent,
	mostVotedOption,
	endsIn,
	onClick,
	className = "",
	status,
	result,
	cosmetics,
}) => {
	const colorCosmetic = cosmetics.find((cosmetic) => cosmetic.type === "color");
	const badgeCosmetic = cosmetics.find((cosmetic) => cosmetic.type === "badge");
	return (
		<div
			className={`group bg-gray-800 backdrop-blur-sm rounded-xl p-5 border border-gray-800 shadow-md
        transition-all duration-300 hover:scale-[1.025] hover:shadow-xl hover:border-gray-600 cursor-pointer flex flex-col justify-between ${className}`}
			role="button"
			onClick={() => onClick && onClick(id)}
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick && onClick(id);
			}}
		>
			<div className="flex flex-col gap-1 overflow-hidden text-center mb-2">
				<p className="font-medium text-white text-base sm:text-lg truncate">{title}</p>
				<p className="text-xs sm:text-sm text-gray-400 truncate">
					<Username username={author?.username} color={colorCosmetic?.value} badge={badgeCosmetic?.value} />
				</p>
			</div>

			<div className="flex items-center justify-start sm:justify-start mt-4">
				<span
					className="flex items-center gap-1 px-1 py-1 rounded-full text-xs sm:text-sm font-medium
     text-gray-200"
				>
					<Vote className="w-4 h-4 text-pink-400" />
					{votes}
				</span>

				<span
					className="flex items-center gap-1 px-1 py-1 rounded-full text-xs sm:text-sm font-medium
     text-gray-200"
				>
					<MessageSquare className="w-4 h-4 text-blue-400" />
					{comments}
				</span>
			</div>

			{percent !== undefined && status === "Valid" && (
				<div className="w-full">
					<div className="flex justify-between items-center mb-1">
						<span className="text-green-400 font-semibold text-sm sm:text-base truncate max-w-[65%] group-hover:text-green-300 transition-colors">
							{mostVotedOption} à {percent}%
						</span>
						{endsIn && (
							<span className="text-gray-400 text-xs sm:text-sm font-medium">
								<TimeUntilEnd endDate={endsIn} />
							</span>
						)}
					</div>
					<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
						<div
							className="h-2 rounded-full transition-all duration-500"
							style={{
								width: `${percent}%`,
								background: `linear-gradient(90deg, #22c55e, #16a34a)`,
							}}
						/>
					</div>
				</div>
			)}
			{status === "Closed" && (
				<div className="flex justify-between items-center mb-1">
					<span className="text-gray-400 text-xs sm:text-sm font-medium">Prédiction terminée</span>
					<div className="flex flex-row text-green-400 font-semibold text-sm sm:text-base truncate max-w-[65%] group-hover:text-green-300 transition-colors">
						<Trophy className="mr-2" /> {result}
					</div>
				</div>
			)}
		</div>
	);
};

export default PredictionCard;
