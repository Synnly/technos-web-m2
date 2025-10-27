import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar.component";
import { ValidatePredictionsTable } from "../components/predictions/ValidatePredictionsTable";
import type { Toast } from "../components/toast/Toast.interface";
import PredictionController from "../modules/prediction/prediction.controller";
import { userController } from "../modules/user/user.controller";

function ValidatePrediction() {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [_toast, setToast] = useState<Toast | null>(null);
	const [_points, setPoints] = useState<number>(0);
	const token = localStorage.getItem("token");
	const [predictions, setPredictions] = useState<any[]>([]);
	const [usersMap, setUsersMap] = useState<Record<string, string>>({});

	const waitingPredictions = (predictions || []).filter((p) => p.status === "waiting");

	const fetchAllPredictions = async () => {
		const data = await PredictionController.getAllPredictions(token, setToast);
		setPredictions(data);
	};
	const fetchAllUsers = async () => {
		const map = await userController.getAllUsers(token, setToast);
		setUsersMap(map);
	};

	useEffect(() => {
		fetchAllUsers();
		fetchAllPredictions();
	}, [token]);

	const handleValidate = async (id: string) => {
		if (!token) {
			setToast?.({ message: "Utilisateur non authentifié", type: "error" });
			return;
		}
		try {
			await PredictionController.updatePredictionStatus(id, "validate", token!, setToast);
			await fetchAllPredictions();
		} catch (err: any) {
			console.error(err);
			setToast?.({ message: err?.message || "Erreur lors de la validation", type: "error" });
		}
	};

	const handleRefuse = async (id: string) => {
		if (!token) {
			setToast?.({ message: "Utilisateur non authentifié", type: "error" });
			return;
		}
		try {
			await PredictionController.updatePredictionStatus(id, "refuse", token!, setToast);
			await fetchAllPredictions();
		} catch (err: any) {
			console.error(err);
			setToast?.({ message: err?.message || "Erreur lors du refus", type: "error" });
		}
	};

	return (
		<>
			<Sidebar
				user={user}
				token={token!}
				setUser={setUser}
				setPoints={setPoints}
				setToast={setToast}
				onPredictionCreated={fetchAllPredictions}
				onCollapsedChange={(value: boolean) => setSidebarCollapsed(value)}
			/>
			<main
				className={`flex-1 transition-all h-screen bg-gray-900 backdrop-blur-sm
                    ${sidebarCollapsed ? "ml-20 p-6 sm:p-8 md:p-10" : "ml-0 lg:ml-80 p-6 sm:p-8 md:p-10"}`}
			>
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-white">Prédictions en attente</h1>
					<p className="text-sm text-gray-400 mt-1">Liste des prédictions nécessitant une validation</p>
				</div>

				<div>
					<ValidatePredictionsTable
						data={waitingPredictions}
						usersMap={usersMap}
						pageSize={10}
						onValidate={handleValidate}
						onRefuse={handleRefuse}
					/>
				</div>
			</main>
		</>
	);
}

export default ValidatePrediction;
