import { useEffect, useState } from "react";
import PredictionController from "../modules/prediction/prediction.controller";
import { userController } from "../modules/user/user.controller";
import type { Toast } from "../components/toast/Toast.interface";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/sidebar/Sidebar.component";
import ConfirmResultsTable from "../components/predictions/confirm-results-expired/ConfirmResultsTable";

function confirmResults() {
	const token = localStorage.getItem("token");
	const [user, setUser] = useState<any>(null);
	const [_, setToast] = useState<Toast | null>(null);
	const [___, setPoints] = useState<number>(0);
	const [__, setLoading] = useState(false);
	const { username } = useAuth();
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [usersMap, setUsersMap] = useState<Record<string, string>>({});
	const [____, setPredictions] = useState<any[]>([]);

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(username, token, setToast);
		setUser(u);
	};

	const fetchAllPredictions = async () => {
		setLoading(true);
		const data = await PredictionController.getAllPredictions(token, setToast);
		setPredictions(data);
		setLoading(false);
	};
	const fetchAllUsers = async () => {
		const map = await userController.getAllUsers(token, setToast);
		setUsersMap(map);
	};

	useEffect(() => {
		fetchAllUsers();
		fetchAllPredictions();
	}, [token]);

	useEffect(() => {
		if (username) {
			fetchUserByUsername(username);
			setPoints(user?.points || 0);
		}
	}, [username]);

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
					<h1 className="text-2xl font-semibold text-white">Prédictions expirées</h1>
					<p className="text-sm text-gray-400 mt-1">Liste des prédictions expirées nécessitant le choix de la bonne réponse</p>
				</div>
                <div>
                    <ConfirmResultsTable usersMap={usersMap} />
                </div>
            </main>
		</>
	);
}

export default confirmResults;
