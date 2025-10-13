import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/sidebar/Sidebar.component";
import { useEffect, useState } from "react";
import type { Toast } from "../components/toast/Toast.interface";
import PredictionCard from "../components/predictions/PredictionCard";
import { PredictionController } from "../modules/prediction/prediction.controller";
import { userController } from "../modules/user/user.controller";

function AllPredictions() {
	const { username } = useAuth();
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [toast, setToast] = useState<Toast | null>(null);
	const [open, setOpen] = useState(false);
	const token = localStorage.getItem("token");
	const [predictions, setPredictions] = useState<any[]>([]);
	const [usersMap, setUsersMap] = useState<Record<string, string>>({});
	const [__, setLoading] = useState(false);

	const fetchAllPredictions = async () => {
		setLoading(true);
		const data = await PredictionController.getAllPredictions(
			token,
			setToast,
		);
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

	return (
		<>
			<Sidebar
				user={user}
				token={token!}
				setUser={() => {}}
				setPoints={() => {}}
				setToast={setToast}
				setModalOpen={setOpen}
				onCollapsedChange={(value: boolean) =>
					setSidebarCollapsed(value)
				}
			/>
			<main
				className={
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 ml-20 transition-all bg-gray-900 h-screen"
						: "flex-1 p-2 sm:p-4 md:p-6 ml-0 lg:ml-80 bg-gray-900 h-screen"
				}
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-white cursor-pointer">
					{predictions.map((prediction) => (
						<PredictionCard
							key={prediction._id}
							id={prediction._id}
							title={prediction.title}
							author={usersMap[prediction.user_id]}
							votes={prediction.nbVotes}
							comments={prediction.nbPublications}
							percentLabel={"0"}
							percent={10}
							endsIn={prediction.dateFin.toString()}
							onClick={() => {}}
						/>
					))}
				</div>
			</main>
		</>
	);
}

export default AllPredictions;
