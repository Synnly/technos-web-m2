import Sidebar from "../components/sidebar/Sidebar.component";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userController } from "../modules/user/user.controller";
import ToastComponent from "../components/toast/Toast.component";
import type { Toast } from "../components/toast/Toast.interface";
import { PredictionTimeline } from "../components/predictions/PredictionTimeline";
import PredictionController from "../modules/prediction/prediction.controller";
import OptionGrid from "../components/input/Prediction/options/OptionGrid";
import ConfirmVote from "../components/predictions/ConfirmVote";
import type {
	PredictionWithThisVotesAndPublications,
	TimelineDataPoint,
} from "../modules/prediction/prediction.interface";
import { CalendarClock } from "lucide-react";
import WritePublication from "../components/publications/WritePublication";
import AmountButtonRow from "../components/input/Prediction/amounts/AmountButtonRow";
import PublicationList from "../components/publications/PublicationList";
import type { Publication } from "../modules/publication/publication.interface";
import { PublicationController } from "../modules/publication/publication.controller";
import type { PublicUser } from "../modules/user/user.interface";
import { VoteController } from "../modules/vote/vote.controller";

function Prediction() {
	const { username } = useAuth();
	const token = localStorage.getItem("token");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [points, setPoints] = useState<number>(0);
	const [user, setUser] = useState<any>(null);
	const [users, setUsers] = useState<Array<PublicUser>>([]);
	const [prediction, setPrediction] = useState<PredictionWithThisVotesAndPublications | null>(null);
	const [options, setOptions] = useState<Record<string, number>>({});
	const [aiPronostics, setAIPronostics] = useState<Record<string, number>>({});
	const [publications, setPublications] = useState<Publication[]>([]);
	const [userBets, setUserBets] = useState<Record<string, number>>({});
	const [currentAmount, setCurrentAmount] = useState<number>(0);
	const [customAmount, setCustomAmount] = useState<number>(0);
	const [customAmountSelected, setCustomAmountSelected] = useState<boolean>(false);
	const [optionSelected, setOptionSelected] = useState<string | null>(null);
	const [timelineData, setTimelineData] = useState<Array<TimelineDataPoint>>([]);
	const [votesAsPercentage, setVotesAsPercentage] = useState(true);

	const [toast, setToast] = useState<Toast | null>(null);

	const { id: predictionId = "" } = useParams<{ id: string }>();

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(username, token, setToast);
		setUser(u);
		setPoints(u?.points || 0);
	};

	const fetchPredictionById = async (id: string) => {
		const predictionFetched = await PredictionController.getPredictionById(id, token, setToast);
		setPrediction({ ...predictionFetched } as PredictionWithThisVotesAndPublications);
		setOptions(predictionFetched?.options || {});

		if (predictionFetched?.pronostics_ia) {
			setAIPronostics(predictionFetched.pronostics_ia);
		}
	};

	const fetchPublications = async (prediction_id: string) => {
		const publicationsFetched = await PublicationController.getPublicationsByPredictionId(
			prediction_id,
			token,
			setToast,
		);
		setPublications(publicationsFetched);
	};

	const fetchAllUsers = async () => {
		const usersFetched = await userController.getAllUsers(token, setToast);
		setUsers(usersFetched);
	};

	const fetchTimelineData = async (intervalMinutes: number, votesAsPercentage: boolean, fromStart: boolean) => {
		const response = await PredictionController.getTimelineData(
			predictionId,
			intervalMinutes,
			votesAsPercentage,
			fromStart,
			token!,
			setToast,
		);
		setTimelineData(response);
		setVotesAsPercentage(votesAsPercentage);
	};

	const clearToast = () => setToast(null);

	const onOptionSelect = (option: string) => {
		setOptionSelected(optionSelected === option ? null : option);
	};

	const onConfirmVoteClick = async () => {
		let amount = currentAmount;
		if (customAmountSelected) amount = customAmount;

		if (amount <= 0) {
			setToast({
				message: "Le montant du vote doit être supérieur à zéro.",
				type: "error",
			});
			return;
		}

		if (amount > (user?.points || 0)) {
			setToast({
				message: "Vous n'avez pas assez de points pour parier cette somme.",
				type: "error",
			});
			return;
		}

		if (!optionSelected) {
			setToast({
				message: "Veuillez sélectionner une option avant de confirmer votre vote.",
				type: "error",
			});
			return;
		}

		await VoteController.createVote(amount, predictionId, optionSelected!, user?._id!, token!, setToast);
		setPoints((prevPoints) => prevPoints - amount);
		fetchTimelineData(10, votesAsPercentage, true);

		const updatedUserBets = { ...userBets };
		updatedUserBets[optionSelected!] = (updatedUserBets[optionSelected!] ?? 0) + amount;
		setUserBets(updatedUserBets);

		const updatedOptions = { ...options };
		updatedOptions[optionSelected!] = (updatedOptions[optionSelected!] ?? 0) + amount;
		setOptions(updatedOptions);
	};

	const addPublication = async (newPublication: Publication) => {
		await PublicationController.createPublication(
			newPublication.message,
			predictionId,
			newPublication.parentPublication_id,
			user?._id,
			token,
			setToast,
		);
		setPublications([...publications, newPublication]);
	};

	const toggleLike = async (publicationId: string) => {
		const publication = publications.find((pub) => pub._id === publicationId);
		if (publication) {
			await PublicationController.toggleLike(publicationId, user?._id, token, setToast);

			if (publication.likes.includes(user?._id!)) {
				publication.likes = publication.likes.filter((user_id) => user_id !== user?._id);
			} else {
				publication.likes.push(user?._id!);
			}
			setPublications([...publications]);
		}
	};

	useEffect(() => {
		if (username) {
			fetchUserByUsername(username);
		}
	}, [username]);

	useEffect(() => {
		if (predictionId) {
			fetchPredictionById(predictionId);
			fetchPublications(predictionId);
			fetchTimelineData(10, votesAsPercentage, true);
		}
	}, [predictionId]);

	useEffect(() => {
		if (!user?._id || !prediction?.votes) return;

		const bets = prediction.votes.reduce<Record<string, number>>((acc, vote) => {
			if (String(vote.user_id) === String(user._id)) {
				acc[vote.option] = (acc[vote.option] ?? 0) + (vote.amount ?? 0);
			}
			return acc;
		}, {});
		setUserBets(bets);
	}, [user?._id, prediction?.votes]);

	useEffect(() => {
		fetchAllUsers();
	}, [users.length]);

	useEffect(() => {
		fetchTimelineData(10, votesAsPercentage, true);
	}, [votesAsPercentage]);

	return (
		<div className="bg-gray-900 mx-auto px-6 py-8 w-screen min-h-screen flex flex-col select-none">
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
				<p className="text-xl md:text-3xl font-bold mb-2 text-white">{prediction?.title}</p>
				<div className="text-sm md:text-base text-gray-400 mb-2 flex gap-2">
					<CalendarClock strokeWidth={1.5} className="w-5 h-5 md:w-6" />
					{prediction?.dateFin?.toLocaleDateString()}
				</div>
				<div className={`text-sm md:text-base text-gray-400 mb-2 ${prediction?.description ? "" : "italic"}`}>
					{prediction?.description ?? "Aucune description fournie"}
				</div>
				<div className="h-50 md:h-100 border border-gray-700 rounded-lg p-4 md:p-8">
					<div className="h-full">
						<PredictionTimeline votesAsPercentage={votesAsPercentage} timelineData={timelineData} />
					</div>
				</div>
				<div className="text-white mt-5">
					Vous avez <b>{points}</b> points.
				</div>
				<div className="mt-5">
					<AmountButtonRow
						currentAmount={currentAmount}
						customAmount={customAmount}
						customAmountSelected={customAmountSelected}
						setCurrentAmount={setCurrentAmount}
						setCustomAmount={setCustomAmount}
						setCustomAmountSelected={setCustomAmountSelected}
					/>
				</div>
				<div className="mt-4">
					<OptionGrid
						options={options}
						userBets={userBets}
						onOptionSelect={onOptionSelect}
						optionSelected={optionSelected}
						aiPronostics={aiPronostics}
					/>
				</div>
				<div className="mt-4">
					<ConfirmVote onClick={onConfirmVoteClick} />
				</div>
				<div className="mt-5">
					<WritePublication
						predictionId={predictionId}
						user_id={user?._id}
						placeholder={"Écrivez votre publication ..."}
						addPublication={addPublication}
					/>
				</div>
				<div className="mt-3">
					<PublicationList
						predictionId={predictionId}
						user_id={user?._id}
						users={users}
						publications={publications}
						addPublication={addPublication}
						toggleLike={toggleLike}
					/>
				</div>
			</main>
		</div>
	);
}

export default Prediction;
