import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Toast } from "../components/toast/Toast.interface";
import PredictionController from "../modules/prediction/prediction.controller";
import { Form } from "antd";

import IsNotAuthenticatedHome from "../components/home/home-page/IsNotAuthenticatedHome.component";
import IsAuthenticatedHome from "../components/home/home-page/IsAuthenticatedHome.component";
import { userController } from "../modules/user/user.controller";
import type { PublicUser } from "../modules/user/user.interface";

function Index() {
	const [form] = Form.useForm();
	const { username } = useAuth();
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const [predictions, setPredictions] = useState<any[]>([]);
	const [__, setLoading] = useState(false);
	const [users, setUsers] = useState<Array<PublicUser>>([]);
	const [_, setPoints] = useState<number>(0);
	const [user, setUser] = useState<any>(null);
	const [open, setOpen] = useState(false);

	const [, setError] = useState<string | null>(null);

	const [toast, setToast] = useState<Toast | null>(null);

	const fetchAllPredictions = async () => {
		setLoading(true);
		const data = await PredictionController.getAllValidPredictions(
			token,
			"1",
			"3",
			setToast,
		);
		setPredictions(data);
		setLoading(false);
	};

	const fetchAllUsers = async () => {
		const list = await userController.getAllUsers(token, setToast);
		setUsers(list);
	};

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(
			username,
			token,
			setToast,
		);
		setUser(u);
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

	const handlePredictionClick = (id: string) => {
		navigate(`/prediction/${id}`);
	};

	return isAuthenticated ? (
		<IsAuthenticatedHome
			user={user}
			username={username}
			token={token}
			sidebarCollapsed={sidebarCollapsed}
			setSidebarCollapsed={setSidebarCollapsed}
			form={form}
			open={open}
			setOpen={setOpen}
			toast={toast}
			setToast={setToast}
			predictions={predictions}
			users={users}
			handlePredictionClick={handlePredictionClick}
			fetchAllPredictions={fetchAllPredictions}
			setError={(m: string | null) => setError(m)}
			setPoints={setPoints}
			setUser={setUser}
		/>
	) : (
		<IsNotAuthenticatedHome
			onSignIn={() => navigate("/signin")}
			onSignUp={() => navigate("/signup")}
		/>
	);
}

export default Index;
