import { Gift, Coins } from "lucide-react";

const DailyRewards: React.FC<{
	onClick?: () => void;
	pointdejaRecup: Boolean;
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
        .sparkle { animation: sparkle 2s ease-in-out infinite; }
        .mascot-float { animation: float 3s ease-in-out infinite; }
        .bounce-gentle { animation: bounce 2s ease-in-out infinite; }
        .glow-pulse { animation: glow 2s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(to right, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

			<div className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 sparkle z-10">
				<Gift className="w-4 h-4" />
			</div>
			<div
				className="absolute -top-1 -left-1 w-4 h-4 text-yellow-300 sparkle z-10"
				style={{ animationDelay: "0.5s" }}
			>
				<Gift className="w-3 h-3" />
			</div>

			<button
				id="daily-points"
				onClick={onClick}
				className="relative w-full p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 glow-pulse hover:from-yellow-500/30 hover:to-orange-500/30 transition-all overflow-hidden cursor-pointer"
			>
				<div className="absolute top-2 right-1 mascot-float">
					<div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
						<Gift className="w-4 h-4 text-yellow-900" />
					</div>
				</div>

				<div className="flex items-center space-x-3">
					<div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center bounce-gentle">
						<Coins className="w-6 h-6 text-yellow-900" />
					</div>
					<div className="text-left">
						<span className="font-bold text-lg gradient-text block">
							Bonus du jour
						</span>

						{pointdejaRecup ? (
							<span className="text-xs text-green-400 font-semibold">
								Récompense déjà récupérée
							</span>
						) : (
							<span className="text-xs text-yellow-300 font-semibold">
								Récompense disponible
							</span>
						)}
					</div>
				</div>

				<div className="mt-2 flex items-center justify-between">
					{!pointdejaRecup ? (
						<span className="text-xs text-yellow-200">
							+10 Points Disponible
						</span>
					) : (
						<span className="text-xs text-yellow-200">
							Revenez demain !
						</span>
					)}
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
				</div>
			</button>
		</div>
	);
};

export default DailyRewards;
