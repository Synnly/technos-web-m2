import { useEffect, useState } from "react";
import AccountTabs from "./components/account/AccountTabs";
import Sidebar from "./components/sidebar/Sidebar.component";
import type { Toast } from "./components/toast/Toast.interface";
import PredictionController from "./modules/prediction/prediction.controller";
import { useAuth } from "./hooks/useAuth";
import { userController } from "./modules/user/user.controller";

function Dashboard() {
	const { username } = useAuth();
	const token = localStorage.getItem("token");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [_____, setPredictions] = useState<any[]>([]);
	const [_, setPoints] = useState<number>(0);
	const [__, setLoading] = useState(false);
	const [_______, setToast] = useState<Toast | null>(null);

	const fetchAllPredictions = async () => {
		setLoading(true);
		const data = await PredictionController.getAllValidPredictions(token, setToast);
		setPredictions(data);
		setLoading(false);
	};

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(username, token, setToast);
		setUser(u);
	};

	const setCurrentCosmetics = (cosmetics: (string | null)[]) => {
		setUser((prevUser: any) => ({
			...prevUser,
			currentCosmetic: cosmetics,
		}));
	};

	useEffect(() => {
		if (username) {
			fetchUserByUsername(username);
		}
	}, [username]);

	return (
		<div className="bg-gray-900 w-screen min-h-screen flex flex-col select-none">
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
				className={`mx-5 lg:mx-20 py-8 pt-19 ${
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 md:pt-19 lg:pt-6 lg:ml-40 transition-all"
						: "flex-1 p-2 sm:p-4 md:p-6 lg:ml-100"
				}`}
			>
				<AccountTabs setCurrentCosmetics={setCurrentCosmetics}/>
			</main>
		</div>
	);
}

export default Dashboard;
