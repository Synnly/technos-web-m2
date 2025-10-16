import { useState } from "react";
import AccountTabs from "./components/account/AccountTabs";
import Sidebar from "./components/sidebar/Sidebar.component";
import type { Toast } from "./components/toast/Toast.interface";
import PredictionController from "./modules/prediction/prediction.controller";

function Dashboard() {
	const token = localStorage.getItem("token");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [_____, setPredictions] = useState<any[]>([]);
	const [_, setPoints] = useState<number>(0);
	const [__, setLoading] = useState(false);
	const [_______, setToast] = useState<Toast | null>(null);
	const fetchAllPredictions = async () => {
		setLoading(true);
		const data = await PredictionController.getAllPredictions(
			token,
			setToast,
		);
		setPredictions(data);
		setLoading(false);
	};

	return (
		<div className="bg-gray-900 min-h-screen">
			<Sidebar
				user={user}
				token={token!}
				setUser={setUser}
				setPoints={setPoints}
				setToast={setToast}
				onPredictionCreated={fetchAllPredictions}
				onCollapsedChange={(value: boolean) =>
					setSidebarCollapsed(value)
				}
			/>
			<main
			className={
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 ml-20 transition-all"
						: "flex-1 p-2 sm:p-4 md:p-6 ml-0 lg:ml-72"
				}>
					<AccountTabs />
			</main>
		

		</div>
	);
}

export default Dashboard;
