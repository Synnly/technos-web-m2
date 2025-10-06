import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

interface Cosmetic {
	_id: string;
	name: string;
	cost: number;
	type?: string;
	hexColor?: string;
}

export default function Shop() {
	const { isAuthenticated, username } = useAuth();
	const [allCosmetics, setAllCosmetics] = useState<Cosmetic[]>([]);
	const [ownedIds, setOwnedIds] = useState<string[]>([]);
	const parseStored = (): (string | null)[] => {
		try {
			const raw = localStorage.getItem("appliedCosmetics");
			if (!raw) return [null, null];
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return [parsed[0] ? String(parsed[0]) : null, parsed[1] ? String(parsed[1]) : null];
			return [String(parsed), null];
		} catch (e) {
			const raw = localStorage.getItem("appliedCosmetic");
			if (raw) return [String(raw), null];
			return [null, null];
		}
	};
	const [currentApplied, setCurrentApplied] = useState<(string | null)[]>(parseStored());
	const [loading, setLoading] = useState(false);
	const [buyingId, setBuyingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [points, setPoints] = useState<number | null>(null);

	useEffect(() => {
		setLoading(true);
		const token = localStorage.getItem("token");
		axios
			.get(`${API_URL}/cosmetic`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			})
			.then((res) => setAllCosmetics(res.data || []))
			.catch((e) => console.error(e))
			.finally(() => setLoading(false));

		if (username) {
			axios
				.get(`${API_URL}/user/${username}`, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				})
				.then((res) => {
					const user = res.data;
					setOwnedIds(
						(user?.cosmeticsOwned || []).map((id: any) =>
							String(id),
						),
					);
					setPoints(user?.points ?? null);
					if (user?.currentCosmetic) {
						const normalize = (val: any): (string | null)[] => {
							const out: (string | null)[] = [null, null];
							if (!val) return out;
							if (Array.isArray(val)) {
								out[0] = val[0] ? String(val[0]) : null;
								out[1] = val[1] ? String(val[1]) : null;
								return out;
							}
							if (typeof val === 'object' && val._id) {
								out[0] = String(val._id);
								return out;
							}
							out[0] = String(val);
							return out;
						};
						const arr = normalize(user.currentCosmetic);
						setCurrentApplied(arr);
						localStorage.setItem("appliedCosmetics", JSON.stringify(arr));
					}
				})
				.catch(() => {
					setOwnedIds([]);
				});
		}
	}, [username]);

	if (!isAuthenticated)
		return <div>Connectez-vous pour accéder à la boutique.</div>;

	const buy = async (cosmetic: Cosmetic) => {
		if (!username) return setError("Utilisateur introuvable");
		if (ownedIds.includes(String(cosmetic._id)))
			return setError("Vous possédez déjà ce cosmétique");
		if (points !== null && points < cosmetic.cost)
			return setError("Vous n'avez pas assez de points");

		if (!confirm(`Acheter ${cosmetic.name} pour ${cosmetic.cost} points ?`))
			return;

		setError(null);
		setBuyingId(cosmetic._id);
		try {
			const token = localStorage.getItem("token");

			const url = `${API_URL}/user/${username}/buy/cosmetic/${cosmetic._id}`;
			const res = await axios.post(
				url,
				{},
				{ headers: token ? { Authorization: `Bearer ${token}` } : {} },
			);

			const updatedUser = res.data;
			if (updatedUser?.cosmeticsOwned) {
				setOwnedIds(
					(updatedUser.cosmeticsOwned || []).map((id: any) =>
						String(id),
					),
				);
			} else {
				setOwnedIds((ids) =>
					Array.from(new Set([...ids, String(cosmetic._id)])),
				);
			}
			if (typeof updatedUser?.points === "number")
				setPoints(updatedUser.points);
			if (updatedUser?.currentCosmetic) {
				const arr = normalizeCosmeticArray(updatedUser.currentCosmetic);
				setCurrentApplied(arr);
				localStorage.setItem("appliedCosmetics", JSON.stringify(arr));
			}

			alert("Achat réussi");
		} catch (err: any) {
			console.error(err);
			setError(err?.response?.data?.message || "Erreur lors de l'achat");
		} finally {
			setBuyingId(null);
		}
	};

	const normalizeCosmeticArray = (val: any): (string | null)[] => {
		const out: (string | null)[] = [null, null];
		if (!val) return out;
		if (Array.isArray(val)) {
			out[0] = val[0] ? String(val[0]) : null;
			out[1] = val[1] ? String(val[1]) : null;
			return out;
		}
		if (typeof val === "object" && val._id) {
			out[0] = String(val._id);
			return out;
		}
		out[0] = String(val);
		return out;
	};

	const toggleEquip = async (cosmetic: Cosmetic) => {
		if (!username) return setError("Utilisateur introuvable");
		setError(null);
		const token = localStorage.getItem("token");
		const slot = cosmetic.type && String(cosmetic.type).toLowerCase().includes('color') ? 0 : 1;
		const current = [currentApplied[0] ?? null, currentApplied[1] ?? null];
		if (current[slot] === String(cosmetic._id)) {
			current[slot] = null;
		} else {
			current[slot] = String(cosmetic._id);
		}
		try {
			const res = await axios.put(
				`${API_URL}/user/${username}`,
				{ currentCosmetic: current },
				{ headers: token ? { Authorization: `Bearer ${token}` } : {} },
			);
			const updated = res.data;
			const arr = normalizeCosmeticArray(updated?.currentCosmetic ?? current);
			setCurrentApplied(arr);
			localStorage.setItem("appliedCosmetics", JSON.stringify(arr));
		} catch (err: any) {
			setError(err?.response?.data?.message || "Impossible d'appliquer");
		}
	};

	const available = allCosmetics.filter(
		(c) => !ownedIds.includes(String(c._id)),
	);

	return (
		<div className="max-w-3xl mx-auto p-4">
			<header className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Boutique</h1>
				<div>
					{points !== null && (
						<div className="text-sm">
							Vos points: <strong>{points}</strong>
						</div>
					)}
				</div>
			</header>

			{error && <div className="text-red-600 mb-2">{error}</div>}

			<section className="mb-6">
				<h2 className="font-semibold mb-2">Disponibles</h2>
				{loading ? (
					<div>Chargement...</div>
				) : available.length === 0 ? (
					<div>Aucun cosmétique disponible.</div>
				) : (
					<div className="grid grid-cols-2 gap-3">
						{available.map((c) => (
							<div
								key={c._id}
								className="p-3 border rounded flex flex-col justify-between"
							>
								<div>
									<div className="font-medium">{c.name}</div>
									<div className="text-xs text-gray-500">
										Coût: {c.cost} points
									</div>
									{c.type === "color" && c.hexColor && (
										<div
											className="mt-2"
											style={{
												background: c.hexColor,
												width: 36,
												height: 18,
												borderRadius: 4,
											}}
										/>
									)}
								</div>
								<div className="mt-3">
									<button
										disabled={buyingId === c._id}
										onClick={() => buy(c)}
										className="px-3 py-1 bg-blue-600 text-white rounded"
									>
										{buyingId === c._id
											? "Achat..."
											: "Acheter"}
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			<section>
				<h2 className="font-semibold mb-2">Vos cosmétiques</h2>
				{ownedIds.length === 0 ? (
					<div className="text-sm text-gray-500">
						Vous ne possédez encore rien.
					</div>
				) : (
					<div className="grid grid-cols-2 gap-3">
						{allCosmetics
							.filter((c) => ownedIds.includes(String(c._id)))
							.map((c) => (
								<div
									key={c._id}
									className="p-3 border rounded flex flex-col justify-between"
								>
									<div>
										<div className="font-medium">
											{c.name}{" "}
												{currentApplied.includes(String(c._id)) && (
												<span className="text-green-600 text-sm">
													(Appliqué)
												</span>
											)}
										</div>
										<div className="text-xs text-gray-500">
											Coût: {c.cost}
										</div>
									</div>
									<div className="mt-3">
										{currentApplied.includes(String(c._id)) ? (
											<button
												onClick={() => toggleEquip(c)}
												className="px-3 py-1 bg-green-600 text-white rounded"
												title="Cliquer pour désélectionner"
											>
												Appliqué
											</button>
										) : (
											<button
												onClick={() => toggleEquip(c)}
												className="px-3 py-1 bg-gray-200 rounded"
											>
												Appliquer
											</button>
										)}
									</div>
								</div>
							))}
					</div>
				)}
			</section>
		</div>
	);
}
