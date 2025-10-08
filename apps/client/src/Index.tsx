import { use, useEffect, useState, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreatePredictionForm from "./components/predictions/CreatePredictionForm";
import PredictionsList from "./components/predictions/PredictionsList";
import Sidebar from "./components/sidebar/Sidebar.component";
import ToastComponent from "./components/toast/Toast.component";
import type { Toast } from "./components/toast/Toast.interface";
import Modal from "./components/modal/modal.component";
import type { FormField } from "./components/modal/modal.interface";
import GenericForm from "./components/form/Form.component";
import { InputText } from "./components/inputs/InputText.component";
import { DatePicker } from "antd";
import InputOptions from "./components/input/Options/InputOptions.component";

const API_URL = import.meta.env.VITE_API_URL;

export interface Prediction {
	_id: string;
	title: string;
	description?: string;
	dateFin: string;
	status: string;
	options: Record<string, number>;
	result: string;
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
	  const [open, setOpen] = useState(false);

	const [, setError] = useState<string | null>(null);

	 const fields: FormField[] = [
   	{ name: 'title', label: 'Titre', component: InputText, componentProps: { placeholder: 'Titre' }, formItemProps: { rules: [{ required: true }] } },
   	{ name: 'description', label: 'Description', component: InputText, componentProps: { placeholder: 'Description' } },
   	{ name: 'date de fin', label: 'Date de fin', component: DatePicker, componentProps : { placeholder: ''}, formItemProps: {rules: [{required: true}]}},
   	{ name: 'options', label: 'Options', component: InputOptions, formItemProps: {rules: [{required: true}]}}
 ];

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

	const getCurrentUserId = () => {
		if (!username) return undefined;
		const entry = Object.entries(usersMap).find(([, u]) => u === username);
		return entry ? entry[0] : undefined;
	};

	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [toast, setToast] = useState<Toast | null>(null);

	const clearToast = useCallback(() => setToast(null), []);

	const deletePrediction = async (id: string) => {
		if (!confirm("Supprimer cette prédiction ?")) return;
		const token = localStorage.getItem("token");
		if (!token) return setError("Utilisateur non authentifié");
		setDeletingId(id);
		try {
			await axios.delete(`${API_URL}/prediction/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setToast({message : "Prédiction supprimée", type : "success"});
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


	if (!isAuthenticated) {
		return (
			<div>
				<h1>Bienvenue sur notre application</h1>
				<p>Veuillez vous connecter ou vous inscrire pour continuer.</p>
			</div>
		);
	}

	return (
		<div>
			<Sidebar
				user={user}
				token={token!}
				setUser={setUser}
				setPoints={setPoints}
				setToast={setToast}
				setModalOpen={setOpen}
			/>
			{toast && (
				<ToastComponent
					message={toast.message!}
					type={toast.type!}
					onClose={clearToast}
				/>
			)}
			<Modal isOpen={open} onClose={() => setOpen(false)}>
				<GenericForm title="Création d'une prédiction"  fields={fields} onFinish={values => console.log(values)} />
			</Modal>
		</div>
	);
}

export default Index;
