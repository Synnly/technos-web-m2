import axios from "axios";
import GenericForm from "./components/form/Form.component";
import type { FormField } from "./components/modal/modal.interface";
import InputText from "./components/input/Text/InputText.component";
import InputPassword from "./components/input/Password/InputPassword.component";
import AccountTabs from "./components/account/AccountTabs";
import { useAuth } from "./hooks/useAuth";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import CosmeticPicker from "./components/cosmetics/CosmeticPicker";
import CreateCosmeticForm from "./components/cosmetics/CreateCosmeticForm";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface TokenJwtPayload extends JwtPayload {
	username: string;
	role: string;
}

interface Prediction {
	_id: string;
	title: string;
	description?: string;
	dateFin: string;
	status: string;
	options: Record<string, number>;
	result: string;
}

function Dashboard() {
	const { logout } = useAuth();
	const navigate = useNavigate();

	// récupération du username/role depuis le token
	const token = localStorage.getItem("token");
	let username = "";
	let role = "";
	if (token) {
		try {
			const decoded = jwtDecode<TokenJwtPayload>(token);
			username = decoded.username;
			role = decoded.role;
		} catch (err) {
			console.error("Token invalide :", err);
			logout();
		}
	}

	// AntD GenericForm will be used instead of react-hook-form
	const [expiredPrediction, setExpiredPrediction] = useState<Prediction[]>(
		[],
	);
	const [waitingPrediction, setWaitingPrediction] = useState<Prediction[]>(
		[],
	);

	// fonction mise à jour d'une prédiction
	const handleUpdateStatus = async (
		prediction: Prediction,
		status: "Valid" | "Invalid",
	) => {
		try {
			await axios.put(
				`${API_URL}/prediction/${prediction._id}`,
				{ ...prediction, status },
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			// rafraîchir les listes après modification
			const expiredRes = await axios.get<Prediction[]>(
				`${API_URL}/prediction/expired`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setExpiredPrediction(expiredRes.data);

			const waitingRes = await axios.get<Prediction[]>(
				`${API_URL}/prediction/waiting`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setWaitingPrediction(waitingRes.data);
		} catch (err) {
			console.error(
				"Erreur lors de la mise à jour de la prédiction :",
				err,
			);
		}
	};

	function handleValidate(predictionId: string, winningOption: string) {
		axios
			.put(`${API_URL}/prediction/${predictionId}/validate`, {
				winningOption,
			})
			.then(() => {
				alert("Prédiction validée ✅");
			})
			.catch((err) => {
				console.error("Erreur de validation :", err);
			});
	}

	// Si admin, récupérer les prédictions expirées et en attente
	useEffect(() => {
		if (role === "admin") {
			// Récupérer les prédictions expirées
			axios
				.get<Prediction[]>(`${API_URL}/prediction/expired`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then((res) => setExpiredPrediction(res.data))
				.catch((err) =>
					console.error(
						"Erreur lors de la récupération des prédictions expirées :",
						err,
					),
				);

			// Récupérer les prédictions en attente
			axios
				.get<Prediction[]>(`${API_URL}/prediction/waiting`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then((res) => setWaitingPrediction(res.data))
				.catch((err) =>
					console.error(
						"Erreur lors de la récupération des prédictions en attente :",
						err,
					),
				);
		}
	}, [role]);

	// account update handled in GenericForm onFinish

	const confirmAccountDeletionHandler = () => {
		if (!token) return;

		let decodedToken: TokenJwtPayload;
		try {
			decodedToken = jwtDecode<TokenJwtPayload>(token);
		} catch (err) {
			console.error("Token invalide :", err);
			logout();
			return;
		}

		if (
			confirm(
				"Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible !",
			)
		) {
			axios
				.delete(`${API_URL}/user/${decodedToken.username}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then(() => {
					logout();
					navigate("/signup", { replace: true });
				});
		}
	};

	return (
		<div>
			<h1>Dashboard</h1>

			{/* Partie admin */}
			{role === "admin" && (
				<div className="my-8">
					<div className="mb-6">
						<CreateCosmeticForm />
					</div>
					<div>
						<h2>Prédictions en attente de validation :</h2>
						{waitingPrediction.length === 0 ? (
							<p>Aucune prédiction à valider</p>
						) : (
							<ul>
								{waitingPrediction.map((p) => (
									<div
										key={p._id}
										className="p-8 border border-gray-300 rounded mb-6 bg-neutral-700"
									>
										<li>
											<strong>{p.title}</strong> — Finie
											le{" "}
											{new Date(
												p.dateFin,
											).toLocaleString()}
										</li>
										<li>Description : {p.description}</li>
										<span className="flex gap-4 mt-4">
											<button
												onClick={() =>
													handleUpdateStatus(
														p,
														"Valid",
													)
												}
											>
												Valider
											</button>
											<button
												onClick={() =>
													handleUpdateStatus(
														p,
														"Invalid",
													)
												}
											>
												Refuser
											</button>
										</span>
									</div>
								))}
							</ul>
						)}
					</div>

					<div>
						<h2>Prédictions expirées pas encore validé:</h2>
						{expiredPrediction.length === 0 ? (
							<p>Aucune prédiction expirée</p>
						) : (
							<ul>
								{expiredPrediction.map((p) => (
									<div
										key={p._id}
										className="p-8 border border-gray-300 rounded mb-6 bg-gray-700"
									>
										<li>
											<strong>{p.title}</strong> — Finie
											le{" "}
											{new Date(
												p.dateFin,
											).toLocaleString()}{" "}
											— Statut: {p.status}
										</li>
										<div className="mt-6">
											<p className="mb-2 text-sm text-white">
												Cliquez sur l’option gagnante à
												valider, les points seront
												crédités automatiquement aux
												joueurs qui ont parié dessus :
											</p>

											<span className="flex gap-4 mt-4">
												{Object.keys(p.options).map(
													(optionKey) => (
														<button
															key={optionKey}
															onClick={() =>
																handleValidate(
																	p._id,
																	optionKey,
																)
															}
															className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
														>
															Valider "{optionKey}
															"
														</button>
													),
												)}
											</span>
										</div>
									</div>
								))}
							</ul>
						)}
					</div>
				</div>
			)}

			{/* Partie utilisateur normal */}
			{role !== "admin" && (
				<div className="space-y-6">
					<AccountTabs />

					<GenericForm
						title={`Compte - ${username}`}
						initialValues={{ username }}
						fields={([
							{
								name: "username",
								label: "Nom d'utilisateur",
								component: InputText,
								componentProps: { placeholder: "Nom d'utilisateur" },
								formItemProps: { rules: [{ required: true, min: 3 }] },
							},
							{
								name: "password",
								label: "Mot de passe",
								component: InputPassword,
								componentProps: { placeholder: "Mot de passe" },
							},
							{
								name: "passwordConfirm",
								label: "Confirmer le mot de passe",
								component: InputPassword,
								componentProps: { placeholder: "Confirmer le mot de passe" },
							},
						] as FormField[])}
						onFinish={async (values: any) => {
							// validate passwords match
							if (values.password && values.password !== values.passwordConfirm) {
								alert("Les mots de passe ne correspondent pas");
								return;
							}

							const updatedUser = {
								username: values.username,
								motDePasse: values.password,
							};

							try {
								await axios.put(`${API_URL}/user/${username}`, updatedUser);
								const response = await axios.post(`${API_URL}/user/login`, {
									username: values.username,
									password: values.password,
								});
								localStorage.setItem("token", response.data.token.token);
								window.location.reload();
							} catch (err) {
								console.error(err);
							}
						}}
					/>

					<button onClick={confirmAccountDeletionHandler}>
						Supprimer le compte
					</button>
					{/* Cosmetic picker only for the logged-in user */}
					{username && <CosmeticPicker username={username} />}
				</div>
			)}
		</div>
	);
}

export default Dashboard;



