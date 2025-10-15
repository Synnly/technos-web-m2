import React from "react";

interface XPBarProps {
	points: number;
	levelThresholds?: number[];
}

const XPBar: React.FC<XPBarProps> = ({
	points,
	levelThresholds = [0, 100, 250, 500, 1000, 2000],
}) => {
	const currentLevel = levelThresholds.findIndex((t) => points < t);
	const level =
		currentLevel === -1 ? levelThresholds.length - 1 : currentLevel - 1;
	const currentThreshold = levelThresholds[level] ?? 0;
	const nextThreshold = levelThresholds[level + 1] ?? levelThresholds[level];
	const progress =
		((points - currentThreshold) / (nextThreshold - currentThreshold)) *
		100;
	const remaining = Math.max(nextThreshold - points, 0);

	return (
		<div className="relative w-full bg-[#0f172a] rounded-2xl p-6 border border-green-400/30 text-white shadow-2xl overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/20 pointer-events-none" />

			<div className="flex justify-between items-center mb-3 text-sm relative z-10">
				<span className="text-gray-300 font-semibold tracking-wide">
					🧬 Niveau {level + 1}
				</span>
				<span className="text-gray-400 text-xs font-mono">
					{points} / {nextThreshold} XP
				</span>
			</div>

			<div className="relative w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
				<div
					className="absolute left-0 top-0 h-full bg-[length:300%_100%] animate-wave rounded-full"
					style={{
						width: `${Math.min(progress, 100)}%`,
						backgroundImage:
							"linear-gradient(90deg, #16a34a 0%, #22c55e 30%, #86efac 50%, #22c55e 70%, #16a34a 100%)",
						filter: "brightness(1.5) saturate(1.3)",
					}}
				></div>

				<div
					className="absolute left-0 top-0 h-full bg-green-400/25 blur-md animate-glow rounded-full"
					style={{
						width: `${Math.min(progress, 100)}%`,
					}}
				></div>

				<div className="absolute inset-0 rounded-full border border-green-500/40" />
			</div>

			<div className="flex justify-between mt-3 text-xs text-gray-400 relative z-10">
				<span>🌱 {remaining} XP restants</span>
				<span className="text-green-400 font-semibold">
					🎯 Prochain niveau : {level + 2}
				</span>
			</div>

			<style>{`
        @keyframes wave {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 300% 0%;
          }
        }
        .animate-wave {
          animation: wave 2.5s linear infinite;
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.6;
            filter: brightness(1.1);
          }
          50% {
            opacity: 1;
            filter: brightness(1.6);
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
		</div>
	);
};

export default XPBar;
