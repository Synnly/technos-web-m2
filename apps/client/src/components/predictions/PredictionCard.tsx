import React from "react";
import { Users, MessageSquare } from "lucide-react";
import type { PredictionCardProps } from "./PredictionCard.interface";
import TimeUntilEnd from "../time-until-end/TimeUntilEnd";

const PredictionCard: React.FC<PredictionCardProps> = ({
	id,
	title,
	author = "unknown",
	votes = "0",
	comments = "0",
	percentLabel,
	percent,
	endsIn,
	onClick,
	className = "",
}) => {
	return (
		<div
			className={`group bg-gray-800 rounded-xl p-4 border border-gray-700 transition-colors ${className} \
				motion-safe:transform-gpu motion-safe:transition-transform motion-safe:duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg`}
			role="button"
			onClick={() => onClick && onClick(id)}
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClick && onClick(id);
			}}
		>
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center space-x-3">
					<div>
						<p
							className="font-medium text-white group-hover:text-green-300 transition-colors"
							contentEditable={false}
						>
							{title}
						</p>
						<p
							className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors"
							contentEditable={false}
						>
							by {author}
						</p>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4 text-sm text-gray-400">
					<span
						className="flex items-center gap-1 group-hover:text-white transition-colors"
						contentEditable={false}
					>
						<Users className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
						{votes}
					</span>
					<span
						className="flex items-center gap-1 group-hover:text-white transition-colors"
						contentEditable={false}
					>
						<MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
						{comments} comments
					</span>
				</div>
			</div>
			<div className="flex items-center justify-between mt-4">
				<div
					className="text-lg font-bold text-green-400 group-hover:text-green-300 transition-colors"
					contentEditable={false}
				>
					{percentLabel ??
						(percent !== undefined ? `${percent}%` : "")}
				</div>
				{endsIn && (
					<div
						className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors"
						contentEditable={false}
					>
						<TimeUntilEnd endDate={endsIn} />
					</div>
				)}
			</div>
		</div>
	);
};

export default PredictionCard;
