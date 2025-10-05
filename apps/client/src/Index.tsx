import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreatePredictionForm from "./components/predictions/CreatePredictionForm";
import PredictionsList from "./components/predictions/PredictionsList";

const API_URL = import.meta.env.VITE_API_URL;

export interface Prediction {
	_id: string;
	title: string;
	description?: string;
	dateFin: string;
	status: string;
	options: Record<string, number>;
	results: string;
}
/**
 * Composant principal de l'application.
 * - Affiche la liste des prédictions (publications).
 * - Si l'utilisateur est authentifié, affiche un bouton pour ouvrir un petit formulaire
 *   (utilise `InputText` et `InputSubmit`) afin de créer une nouvelle prédiction.
 */
function Index() {
	const { isAuthenticated, logout, username } = useAuth();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");

	const [predictions, setPredictions] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [showOnlyMine, setShowOnlyMine] = useState(false);
	const [usersMap, setUsersMap] = useState<Record<string, string>>({});
	const [_, setPoints] = useState<number>(0);
	const [user, setUser] = useState<any>(null);

	const [, setError] = useState<string | null>(null);

	const fetchPredictions = async () => {
		setLoading(true);
		try {
			const res = await axios.get<Prediction[]>(
				`${API_URL}/prediction/valid`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setPredictions(res.data);
		} catch (err) {
			console.error(
				"Erreur lors de la récupération des prédictions :",
				err,
			);
		} finally {
			setLoading(false);
		}
	};

	const fetchUsers = async () => {
		try {
			const res = await axios.get(`${API_URL}/user`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const map: Record<string, string> = {};
			(res.data || []).forEach((u: any) => {
				if (u && u._id) map[u._id] = u.username;
			});
			setUsersMap(map);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		if (isAuthenticated) {
			fetchPredictions();
			fetchUsers();
		}
	}, [isAuthenticated]);

	const handleLogout = () => {
		logout();
		navigate("/signin");
	};

	const getCurrentUserId = () => {
		if (!username) return undefined;
		const entry = Object.entries(usersMap).find(([, u]) => u === username);
		return entry ? entry[0] : undefined;
	};

	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);

	const deletePrediction = async (id: string) => {
		if (!confirm("Supprimer cette prédiction ?")) return;
		const token = localStorage.getItem("token");
		if (!token) return setError("Utilisateur non authentifié");
		setDeletingId(id);
		try {
			await axios.delete(`${API_URL}/prediction/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setToast("Prédiction supprimée");
			await fetchPredictions();
		} catch (err: any) {
			console.error(err);
			const msg =
				err?.response?.data?.message || "Erreur lors de la suppression";
			setError(msg);
			setToast(msg);
		} finally {
			setDeletingId(null);
		}
	};

	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 3000);
		return () => clearTimeout(t);
	}, [toast]);

	const fetchUser = async (username: string) =>
		setUser(
			(
				await axios.get(`${API_URL}/user/${username}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
			).data,
		);
	useEffect(() => {
		if (username) {
			fetchUser(username!);
			setPoints(user?.points || 0);
		}
	}, [username]);

	const claimDailyReward = async (user: any) => {
		if (!username) return;
        
		if (
			user.dateDerniereRecompenseQuotidienne &&
			new Date(user.dateDerniereRecompenseQuotidienne).toDateString() ===
				new Date().toDateString()
		) {
			return;
		}
		try {
			const updatedUser = await axios.get(
				`${API_URL}/user/${username}/daily-reward`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setUser(updatedUser.data);
			setPoints(updatedUser.data.points || 0);
			setToast("Récompense quotidienne réclamée ! +10 points");
		} catch (err: any) {
			const msg =
				err?.response?.data?.message || "Erreur lors de la réclamation";
			setToast(msg);
		}
	};

	if (!isAuthenticated) {
		return (
			<div>
				<h1>Bienvenue sur notre application</h1>
				<p>Veuillez vous connecter ou vous inscrire pour continuer.</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto p-4">
			<header className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Publications</h1>
				{isAuthenticated ? (
					<div className="flex items-center gap-2">
						<button
							onClick={() => setShowOnlyMine((s) => !s)}
							className={`px-3 py-1 ${showOnlyMine ? "bg-green-500 text-white" : "bg-white border"} rounded`}
						>
							{showOnlyMine
								? "Toutes les prédictions"
								: "Mes prédictions"}
						</button>
						<button
							onClick={() => setShowForm((s) => !s)}
							className="px-3 py-1 bg-blue-500 text-white rounded"
						>
							{showForm ? "Annuler" : "Créer une prédiction"}
						</button>
						<button
							onClick={() => navigate("/shop")}
							className="px-3 py-1 bg-indigo-500 text-white rounded"
						>
							Boutique
						</button>
						<button
							onClick={handleLogout}
							className="px-3 py-1 bg-gray-200 rounded"
						>
							Déconnexion
						</button>
					</div>
				) : (
					<div>
						<p>
							Veuillez vous connecter pour créer une prédiction.
						</p>
					</div>
				)}
			</header>

			{showForm && isAuthenticated && (
				<CreatePredictionForm
					username={username}
					fetchPredictions={fetchPredictions}
					onClose={() => setShowForm(false)}
					setToast={setToast as any}
				/>
			)}

			<section>
				{user && (
					<div className="mb-4">Vous avez {user.points} points.</div>
				)}
				{user &&
				(!user.dateDerniereRecompenseQuotidienne ||
					new Date(
						user.dateDerniereRecompenseQuotidienne,
					).toDateString() !== new Date().toDateString()) ? (
					<button
						onClick={() => claimDailyReward(user)}
						className="mb-4 px-3 py-1 bg-yellow-500 text-white rounded"
					>
						Réclamer la récompense quotidienne (+10 points)
					</button>
				) : null}
			</section>

			<section>
				{loading ? (
					<div>Chargement...</div>
				) : predictions.length === 0 ? (
					<div>Aucune publication pour le moment.</div>
				) : (
					<PredictionsList
						predictions={predictions}
						usersMap={usersMap}
						currentId={getCurrentUserId()}
						onDelete={deletePrediction}
						deletingId={deletingId}
						showOnlyMine={showOnlyMine}
					/>
				)}
			</section>

			{/* confirmation uses native confirm() */}

			{/* Toast */}
			{toast && (
				<div className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 rounded">
					{toast}
				</div>
			)}
		</div>
	);
}

export default Index;
