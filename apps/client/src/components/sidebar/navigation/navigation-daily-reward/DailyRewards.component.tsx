import { Gift, Coins, CheckCircle2 } from "lucide-react";

const DailyRewards: React.FC<{
	onClick?: () => void;
	pointdejaRecup: boolean;
}> = ({ onClick, pointdejaRecup }) => {
	return (
		<div className="mb-6 relative">
			<style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.3); }
          50% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.6); }
        }
        @keyframes pulse-done {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        .sparkle { animation: sparkle 2s ease-in-out infinite; }
        .mascot-float { animation: float 3s ease-in-out infinite; }
        .bounce-gentle { animation: bounce 2s ease-in-out infinite; }
        .glow-pulse { animation: glow 2s ease-in-out infinite; }
        .pulse-done { animation: pulse-done 3s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(to right, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

			{!pointdejaRecup && (
				<>
					<div className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 sparkle z-10">
						<Gift className="w-4 h-4" />
					</div>
					<div
						className="absolute -top-1 -left-1 w-4 h-4 text-yellow-300 sparkle z-10"
						style={{ animationDelay: "0.5s" }}
					>
						<Gift className="w-3 h-3" />
					</div>
				</>
			)}

			<button
				id="daily-points"
				onClick={!pointdejaRecup ? onClick : undefined}
				disabled={pointdejaRecup}
				className={`relative w-full p-4 rounded-xl border transition-all overflow-hidden
          ${
				pointdejaRecup
					? "from-gray-700/30 to-gray-800/30 border-gray-600/50 text-gray-400 pulse-done cursor-not-allowed"
					: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 glow-pulse hover:from-yellow-500/30 hover:to-orange-500/30 cursor-pointer"
			}
        `}
			>
				<div className="absolute top-2 right-1 mascot-float">
					<div
						className={`w-8 h-8 rounded-full flex items-center justify-center 
            ${pointdejaRecup ? "bg-gray-500" : "bg-yellow-400"}`}
					>
						{pointdejaRecup ? (
							<CheckCircle2 className="w-4 h-4 text-white" />
						) : (
							<Gift className="w-4 h-4 text-yellow-900" />
						)}
					</div>
				</div>

				<div className="flex items-center space-x-3">
					<div
						className={`w-12 h-12 rounded-xl flex items-center justify-center 
            ${
				pointdejaRecup
					? "bg-gray-600"
					: "bg-gradient-to-r from-yellow-400 to-orange-400 bounce-gentle"
			}`}
					>
						{pointdejaRecup ? (
							<Coins className="w-6 h-6 text-gray-300" />
						) : (
							<Coins className="w-6 h-6 text-yellow-900" />
						)}
					</div>

					<div className="text-left">
						<span
							className={`font-bold text-lg block ${
								pointdejaRecup
									? "text-gray-300"
									: "gradient-text"
							}`}
						>
							Bonus du jour
						</span>

						{pointdejaRecup ? (
							<span className="text-xs text-green-400 font-semibold flex items-center gap-1">
								<CheckCircle2 className="w-3 h-3" /> Récompense
								récupérée
							</span>
						) : (
							<span className="text-xs text-yellow-300 font-semibold">
								Récompense disponible
							</span>
						)}
					</div>
				</div>

				<div className="mt-2 flex items-center justify-between">
					<span className="text-xs text-yellow-200">
						{pointdejaRecup
							? "Revenez demain !"
							: "+10 Points disponibles"}
					</span>

					{!pointdejaRecup && (
						<div className="flex space-x-1">
							<div className="w-2 h-2 bg-yellow-400 rounded-full sparkle"></div>
							<div
								className="w-2 h-2 bg-yellow-400 rounded-full sparkle"
								style={{ animationDelay: "0.3s" }}
							></div>
							<div
								className="w-2 h-2 bg-yellow-400 rounded-full sparkle"
								style={{ animationDelay: "0.6s" }}
							></div>
						</div>
					)}
				</div>
			</button>
		</div>
	);
};

export default DailyRewards;
