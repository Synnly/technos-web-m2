import { colorSchemes } from "../../sidebar/navigation/color";
import { UserRound, Star, Zap, ThumbsUp, Gift, Shield } from "lucide-react";
import type { AccountInfoStatsProps } from "./account-info-stats.interface";

const AccountStats = ({ userData, username }: AccountInfoStatsProps) => {
	const stats = [
		{
			key: "username",
			label: "Nom",
			value: userData?.username ?? username ?? "-",
			scheme: "green",
		},
		{
			key: "points",
			label: "Points",
			value: userData?.points ?? 0,
			scheme: "orange",
		},
		{
			key: "predictions",
			label: "Prédictions",
			value: userData?.predictions?.length ?? 0,
			scheme: "blue",
		},
		{
			key: "votes",
			label: "Votes",
			value: userData?.votes?.length ?? 0,
			scheme: "purple",
		},
		{
			key: "cosmetics",
			label: "Cosmétiques",
			value: userData?.cosmeticsOwned?.length ?? 0,
			scheme: "pink",
		},
		{
			key: "role",
			label: "Rôle",
			value: userData?.role ?? "user",
			scheme: "yellow",
		},
	];

	const iconMap: Record<string, any> = {
		username: UserRound,
		points: Star,
		predictions: Zap,
		votes: ThumbsUp,
		cosmetics: Gift,
		role: Shield,
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
			{stats.map((s) => {
				const scheme = (colorSchemes as any)[s.scheme];
				const Icon = iconMap[s.key];
				return (
					<div key={s.key} className={`${scheme.bg} p-5 rounded-md flex items-center gap-4 w-full`}>
						<div
							className={`${scheme.hoverBg} w-14 h-14 rounded-full flex items-center justify-center border border-white/30`}
						>
							<Icon className={`w-7 h-7 ${scheme.text}`} />
						</div>
						<div className="flex-1">
							<div className="text-sm text-gray-300">{s.label}</div>
							<div className="text-2xl font-bold text-white">{s.value}</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default AccountStats;
