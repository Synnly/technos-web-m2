import Sidebar from "../components/sidebar/Sidebar.component";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userController } from "../modules/user/user.controller";
import ToastComponent from "../components/toast/Toast.component";
import type { Toast } from "../components/toast/Toast.interface";
import { PredictionTimeline } from "../components/predictions/PredictionTimeline";
import type { Prediction } from "../modules/prediction/prediction.interface";
import PredictionController from "../modules/prediction/prediction.controller";
import OptionGrid from "../components/predictions/options/OptionGrid";
import AmountButton from "../components/predictions/AmountButton";
import ConfirmVote from "../components/predictions/ConfirmVote";
import CustomAmountInput from "../components/predictions/CustomAmountInput";

function Prediction() {
	const { username, isAuthenticated } = useAuth();
	const token = localStorage.getItem("token");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	// const [__, setLoading] = useState(false);
	const [_, setPoints] = useState<number>(0);
	const [user, setUser] = useState<any>(null);
	const [prediction, setPrediction] = useState<Prediction | null>(null);
	const [options, setOptions] = useState<Record<string, number>>({});
	const [userBets, setUserBets] = useState<Record<string, number>>({});
	const [currentAmount, setCurrentAmount] = useState<number>(0);
	const [customAmount, setCustomAmount] = useState<number>(0);
	const [customAmountSelected, setCustomAmountSelected] = useState<boolean>(false);
	// const [open, setOpen] = useState(false);
	// const [, setError] = useState<string | null>(null);

	const [toast, setToast] = useState<Toast | null>(null);

	const { id: predictionId = "" } = useParams<{ id: string }>();

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(username, token, setToast);
		setUser(u);
	};

	const fetchPredictionById = async (id: string) => {
		// setLoading(true);
		const prediction = await PredictionController.getPredictionById(id, token, setToast);
		setPrediction({ ...prediction } as Prediction);
		setOptions(prediction?.options || {});

		const userBets =
			prediction?.votes?.reduce(
				(acc: Record<string, number>, vote) => {
					acc[vote.option] = vote.amount || 0;
					return acc;
				},
				{} as Record<string, number>,
			) || {};

		setUserBets(userBets);
		// setLoading(false);
	};

	const clearToast = () => setToast(null);
	const onButtonChange = (amount: number) => {
		setCurrentAmount(amount);
		setCustomAmountSelected(false);
	};

	const onCustomAmountChange = (amount: number) => {
		setCurrentAmount(Math.min(0, customAmount));
		setCustomAmount(amount);
		setCustomAmountSelected(customAmount > 0);
	};

	const onCustomAmountClick = () => {
		setCurrentAmount(Math.min(0, customAmount));
		setCustomAmountSelected(customAmount > 0);
	};

	useEffect(() => {
		if (username) {
			fetchUserByUsername(username);
			setPoints(user?.points || 0);
		}
	}, [username]);

	useEffect(() => {
		if (predictionId) {
			fetchPredictionById(predictionId);
		}
	}, [predictionId]);

	return (
		<div className="bg-gray-900 mx-auto px-6 py-8 w-full min-h-screen flex flex-col select-none">
			<Sidebar
				user={user}
				token={token!}
				setUser={setUser}
				setPoints={setPoints}
				setToast={setToast}
				onPredictionCreated={() => {}}
				onCollapsedChange={(value: boolean) => setSidebarCollapsed(value)}
			/>
			{toast && <ToastComponent message={toast.message!} type={toast.type!} onClose={clearToast} />}

			<main
				className={
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 ml-20 transition-all"
						: "flex-1 p-2 sm:p-4 md:p-6 ml-0 lg:ml-72"
				}
			>
				<p className="text-3xl font-bold mb-4 text-white">{prediction?.title}</p>
				<div className="h-100 border border-gray-700 rounded-lg p-8">
					<div className="h-full">
						<PredictionTimeline predictionId={predictionId} />
					</div>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mt-3">
					<AmountButton
						amount={10}
						onClick={() => {
							onButtonChange(10);
						}}
						currentAmount={currentAmount}
					/>
					<AmountButton
						amount={50}
						onClick={() => {
							onButtonChange(50);
						}}
						currentAmount={currentAmount}
					/>
					<AmountButton
						amount={100}
						onClick={() => {
							onButtonChange(100);
						}}
						currentAmount={currentAmount}
					/>
					<AmountButton
						amount={1000}
						onClick={() => {
							onButtonChange(1000);
						}}
						currentAmount={currentAmount}
					/>
					<AmountButton
						amount={10000}
						onClick={() => {
							onButtonChange(10000);
						}}
						currentAmount={currentAmount}
					/>
					<CustomAmountInput
						onChange={onCustomAmountChange}
						customAmountSelected={customAmountSelected}
						onCustomAmountClick={onCustomAmountClick}
					/>
				</div>
				<div className="mt-3">
					<OptionGrid options={options} userBets={userBets} />
				</div>
				<div className="mt-3">
					<ConfirmVote onConfirm={() => {}} onCancel={() => {}} />
				</div>
			</main>
		</div>
	);
}

export default Prediction;
