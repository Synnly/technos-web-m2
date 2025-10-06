import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

interface Cosmetic {
	_id: string;
	name: string;
	cost: number;
	type?: string;
}

export default function CosmeticPicker({ username }: { username: string }) {
	const { isAuthenticated } = useAuth();
	const [allCosmetics, setAllCosmetics] = useState<Cosmetic[]>([]);
	const [ownedIds, setOwnedIds] = useState<string[]>([]);
	const parseStored = () => {
		try {
			const raw = localStorage.getItem("appliedCosmetics");
			if (!raw) return [] as string[];
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return parsed.map(String);
			return [String(parsed)];
		} catch (e) {
			const raw = localStorage.getItem("appliedCosmetic");
			if (raw) return [String(raw)];
			return [] as string[];
		}
	};
	const [applied, setApplied] = useState<string[]>(parseStored());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		const token = localStorage.getItem("token");
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		axios
			.get(`${API_URL}/cosmetic`, { headers })
			.then((res) => {
				setAllCosmetics(res.data || []);
			})
			.catch(() => {})
			.finally(() => setLoading(false));

		if (username) {
			axios
				.get(`${API_URL}/user/${username}`, { headers })
				.then((res) => {
					const user = res.data;
					setOwnedIds(
						(user?.cosmeticsOwned || []).map((id: any) =>
							String(id),
						),
					);
					if (user?.currentCosmetic) {
						const normalize = (val: any): string[] => {
							if (!val) return [];
							if (Array.isArray(val)) return val.filter(Boolean).map(String).slice(0, 2);
							if (typeof val === 'object' && val._id) return [String(val._id)];
							return [String(val)];
						};
						const arr = normalize(user.currentCosmetic);
						setApplied(arr);
						localStorage.setItem("appliedCosmetics", JSON.stringify(arr));
					}
				})
				.catch(() => {
					setOwnedIds([]);
				});
		}
	}, [username]);

		const apply = async (id: string) => {
			setError(null);
			const cos = allCosmetics.find((c) => String(c._id) === String(id));
			const slot = cos && cos.type && String(cos.type).toLowerCase().includes('color') ? 0 : 1;
			const current = Array.isArray(applied) ? [...applied] : [];
			current[slot] = id;
			setApplied(current);
			localStorage.setItem("appliedCosmetics", JSON.stringify(current));
			const token = localStorage.getItem("token");
			try {
				const res = await axios.put(
					`${API_URL}/user/${username}`,
					{ currentCosmetic: current },
					{ headers: token ? { Authorization: `Bearer ${token}` } : {} },
				);
				const updatedUser = res.data;
				if (updatedUser?.currentCosmetic) {
					const normalize = (val: any): string[] => {
						if (!val) return [];
						if (Array.isArray(val)) return val.filter(Boolean).map(String).slice(0, 2);
						if (typeof val === 'object' && val._id) return [String(val._id)];
						return [String(val)];
					};
					const arr = normalize(updatedUser.currentCosmetic);
					setApplied(arr);
					localStorage.setItem("appliedCosmetics", JSON.stringify(arr));
				} else {
					setApplied(current);
					localStorage.setItem("appliedCosmetics", JSON.stringify(current));
				}
			} catch (err: any) {
				setError(
					err?.response?.data?.message ||
						"Impossible d'appliquer sur le serveur",
				);
			}
		};

	const owned = allCosmetics.filter((c) => ownedIds.includes(String(c._id)));

	if (!isAuthenticated)
		return (
			<div className="text-sm text-gray-500">
				Connectez-vous pour gérer vos cosmétiques
			</div>
		);

	return (
		<div className="my-4">
			<h3 className="font-semibold">Vos cosmétiques</h3>
			{loading ? (
				<div>Chargement...</div>
			) : (
				<div className="grid grid-cols-2 gap-2">
					{owned.length === 0 ? (
						<div className="text-sm text-gray-500">
							Vous ne possédez aucun cosmétique
						</div>
					) : (
						owned.map((c) => (
							<div
								key={c._id}
								className="p-2 border rounded flex items-center justify-between"
							>
								<div>
									<div className="text-sm font-medium">
										{c.name}
									</div>
									<div className="text-xs text-gray-500">
										Coût: {c.cost}
									</div>
								</div>
								<div>
									<button
										className={`px-3 py-1 rounded ${applied.includes(String(c._id)) ? "bg-green-600 text-white" : "bg-gray-200"}`}
										onClick={() => apply(String(c._id))}
									>
										{applied.includes(String(c._id))
											? "Appliqué"
											: "Appliquer"}
									</button>
								</div>
							</div>
						))
					)}
				</div>
			)}
			{error && <div className="text-red-500 text-sm mt-2">{error}</div>}
		</div>
	);
}
