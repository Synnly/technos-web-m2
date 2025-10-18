import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { useEffect, useState } from "react";
import type { User } from "../../modules/user/user.interface";
import { colorSchemes } from "../sidebar/navigation/color";
import { UserRound, Star, Zap, ThumbsUp, Gift, Shield } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
export default function AccountInfoTab() {
	const { username } = useAuth();
	const [userData, setUserData] = useState<User>();

	// password form moved to SettingsTab
	const getUser = async () => {
		if (!username) return;

		try {
			const response = await axios.get(`${API_URL}/user/${username}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			return response.data;
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		const fetchUserData = async () => {
			const data = await getUser();
			setUserData(data);
		};
		fetchUserData();
	}, [username]);

	return (
		<div className="w-full space-y-12">
			<h1 className="text-white text-2xl pt-5">Informations du compte</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
				{(() => {
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

					return stats.map((s) => {
						const scheme = (colorSchemes as any)[s.scheme];
						const Icon = iconMap[s.key];
						return (
							<div
								key={s.key}
								className={`${scheme.bg} p-5 rounded-md flex items-center gap-4 w-full`}
							>
								<div
									className={`${scheme.hoverBg} w-14 h-14 rounded-full flex items-center justify-center border border-white/30`}
								>
									<Icon
										className={`w-7 h-7 ${scheme.text}`}
									/>
								</div>
								<div className="flex-1">
									<div className="text-sm text-gray-300">
										{s.label}
									</div>
									<div className="text-2xl font-bold text-white">
										{s.value}
									</div>
								</div>
							</div>
						);
					});
				})()}
			</div>
		</div>
	);
}
