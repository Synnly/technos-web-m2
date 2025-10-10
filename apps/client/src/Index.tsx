import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/sidebar/Sidebar.component";
import ToastComponent from "./components/toast/Toast.component";
import type { Toast } from "./components/toast/Toast.interface";
import Modal from "./components/modal/modal.component";
import type { FormField } from "./components/modal/modal.interface";
import GenericForm from "./components/form/Form.component";
import { InputText } from "./components/inputs/InputText.component";
import { DatePicker } from "antd";
import InputOptions from "./components/input/Options/InputOptions.component";
import PredictionController from "./modules/prediction/prediction.controller";
import { Form } from "antd";
import Header from "./components/home/Header";
import StatsGrid from "./components/home/StatsGrid";
import XPSection from "./components/home/XPSection";
import PredictionsSection from "./components/home/PredictionsSection";
import type { Prediction } from "./modules/prediction/prediction.interface";

const API_URL = import.meta.env.VITE_API_URL;



function Index() {
	const [form] = Form.useForm();
	const { username } = useAuth();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const [predictions, setPredictions] = useState<any[]>([]);
	const [__, setLoading] = useState(false);
	const [usersMap, _setUsersMap] = useState<Record<string, string>>({});
	const [_, _setPoints] = useState<number>(0);
	const [user, setUser] = useState<any>(null);
	const [open, setOpen] = useState(false);

	const [, setError] = useState<string | null>(null);

	const [toast, setToast] = useState<Toast | null>(null);

	const clearToast = () => setToast(null);

	const fetchPredictions = async () => {
		setLoading(true);
		try {
			const resp = await axios.get<Prediction[]>(
				`${API_URL}/prediction`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setPredictions(resp.data);
		} catch (e) {
			console.error(e);
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
				if (u && u._id && u.username) map[u._id] = u.username;
			});
			_setUsersMap(map);
		} catch (e) {
			console.error(e);
		}
	};

	const fetchUser = async (username: string) => {
		setUser(
			(
				await axios.get(`${API_URL}/user/${username}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
			).data,
		);
	};
	useEffect(() => {
		fetchUsers();
		fetchPredictions();
	}, [token]);

	useEffect(() => {
		if (username) {
			fetchUser(username);
			_setPoints(user?.points || 0);
		}
	}, [username]);

	const handlePredictionClick = (id: string) => {
		navigate(`/prediction/${id}`);
	};

	const fields: FormField[] = [
		{
			name: "title",
			label: "Titre",
			component: InputText,
			componentProps: { placeholder: "Titre" },
			formItemProps: { rules: [{ required: true }] },
		},
		{
			name: "description",
			label: "Description",
			component: InputText,
			componentProps: { placeholder: "Description" },
		},
		{
			name: "dateFin",
			label: "Date de fin",
			component: DatePicker,
		},
		{
			name: "options",
			label: "Options",
			component: InputOptions,
		},
	];

	return (
		<div className="bg-gray-900 mx-auto px-6 py-8 w-full min-h-screen  flex flex-col">
			<Sidebar
				user={user}
				token={token!}
				setUser={setUser}
				setPoints={_setPoints}
				setToast={setToast}
				setModalOpen={setOpen}
				onCollapsedChange={(value: boolean) =>
					setSidebarCollapsed(value)
				}
			/>
			{toast && (
				<ToastComponent
					message={toast.message!}
					type={toast.type!}
					onClose={clearToast}
				/>
			)}
			<Modal isOpen={open} onClose={() => setOpen(false)}>
				<GenericForm
					form={form}
					title="Création d'une prédiction"
					fields={fields}
					onFinish={async (values: any) => {
						const rawDate = values["date de fin"] ?? values.dateFin;
						const dateFin =
							rawDate && typeof rawDate.toISOString === "function"
								? rawDate.toISOString()
								: rawDate;

						const payload = {
							title: values.title,
							description: values.description,
							dateFin,
							options: values.options,
						};

						const result =
							await PredictionController.createPrediction(
								payload,
								{
									username,
									fetchPredictions,
									onClose: () => setOpen(false),
									setToast: (msg: string) =>
										setToast({
											message: msg,
											type: "success",
										}),
									setLocalError: (m: string | null) =>
										setError(m),
								},
							);

						if (result.success) {
							form.resetFields();
						}
					}}
				/>
			</Modal>
			<main
				className={
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 ml-20 transition-all"
						: "flex-1 p-2 sm:p-4 md:p-6 ml-0 lg:ml-72"
				}
			>
				<Header username={username} user={user} />
				<StatsGrid user={user} />
				<XPSection user={user} />
				<PredictionsSection
					predictions={predictions}
					usersMap={usersMap}
					onPredictionClick={handlePredictionClick}
				/>
			</main>
		</div>
	);
}

export default Index;
