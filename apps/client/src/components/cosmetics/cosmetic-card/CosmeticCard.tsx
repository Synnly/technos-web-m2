import { renderWithEmojis } from "../emoji";
import type { CosmeticCardProps } from "./CosmeticCard.interface";

export default function CosmeticCard({
	id,
	name,
	cost,
	type,
	isApplied,
	onApply,
}: CosmeticCardProps) {
	console.log(type);
	return (
		<div
			className="group relative p-4 rounded-xl border border-gray-700 bg-gray-800/70 
                 hover:bg-gray-800/90 transition-all duration-200 shadow-sm hover:shadow-md"
		>
			<div className="flex items-start justify-between">
				<div className="flex flex-col">
					<div className="font-medium text-white truncate text-2xl">
						{type === "color" && <span>{name}</span>}
						{type === "badge" && (
							<span>{renderWithEmojis(name)}</span>
						)}
					</div>
				</div>

				<button
					onClick={() => onApply(id)}
					className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200
            ${
				isApplied
					? "bg-green-600/90 text-white hover:bg-green-500"
					: "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
			}`}
				>
					{isApplied ? "Appliqué" : "Appliquer"}
				</button>
			</div>

			{isApplied && (
				<div className="absolute inset-0 rounded-xl border-2 border-green-500/50 pointer-events-none"></div>
			)}
		</div>
	);
}
