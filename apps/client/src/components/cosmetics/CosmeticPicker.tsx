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
	const [applied, setApplied] = useState<string | null>(
		localStorage.getItem("appliedCosmetic"),
	);
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
						setApplied(String(user.currentCosmetic));
						localStorage.setItem(
							"appliedCosmetic",
							String(user.currentCosmetic),
						);
					}
				})
				.catch(() => {
					setOwnedIds([]);
				});
		}
	}, [username]);

	const apply = async (id: string) => {
		setError(null);
		setApplied(id);
		localStorage.setItem("appliedCosmetic", id);
		const token = localStorage.getItem("token");
		try {
			const res = await axios.put(
				`${API_URL}/user/${username}`,
				{ currentCosmetic: id },
				{ headers: token ? { Authorization: `Bearer ${token}` } : {} },
			);
			const updatedUser = res.data;
			if (updatedUser?.currentCosmetic) {
				setApplied(String(updatedUser.currentCosmetic));
				localStorage.setItem(
					"appliedCosmetic",
					String(updatedUser.currentCosmetic),
				);
			} else {
				setApplied(id);
				localStorage.setItem("appliedCosmetic", id);
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
										className={`px-3 py-1 rounded ${applied === String(c._id) ? "bg-green-600 text-white" : "bg-gray-200"}`}
										onClick={() => apply(String(c._id))}
									>
										{applied === String(c._id)
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
