import Sidebar from "../components/sidebar/Sidebar.component";
import { useState, useEffect, use } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userController } from "../modules/user/user.controller";
import ToastComponent from "../components/toast/Toast.component";
import type { Toast } from "../components/toast/Toast.interface";
import { PredictionTimeline } from "../components/predictions/PredictionTimeline";
import PredictionController from "../modules/prediction/prediction.controller";
import OptionGrid from "../components/predictions/options/OptionGrid";
import ConfirmVote from "../components/predictions/ConfirmVote";
import type { PredictionWithThisVotesAndPublications } from "../modules/prediction/prediction.interface";
import { CalendarClock } from "lucide-react";
import WritePublication from "../components/publications/WritePublication";
import AmountButtonRow from "../components/predictions/amounts/AmountButtonRow";
import PublicationList from "../components/publications/PublicationList";
import type { Publication } from "../modules/publication/publication.interface";

function Prediction() {
	const { username } = useAuth();
	const token = localStorage.getItem("token");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [_, setPoints] = useState<number>(0);
	const [user, setUser] = useState<any>(null);
	const [prediction, setPrediction] = useState<PredictionWithThisVotesAndPublications | null>(null);
	const [options, setOptions] = useState<Record<string, number>>({});
	const [aiPronostics, setAIPronostics] = useState<Record<string, number>>({});
	const [publications, setPublications] = useState<Publication[]>([
		{
			_id: "1",
			message:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga unde eius rem, sed neque alias nam ipsum commodi facere quam architecto molestias illum ducimus error, cupidita et consectetur adipisicing elit. Fuga unde eius rem, sed neque alias nam ipsum commodi facere quam architecto molestias illum ducimus error, cupiditate sint, illo tempora quis.",
			datePublication: new Date(),
			prediction_id: "68f39ca2e5611f91b1536c99",
			user_id: "User1",
			likes: [],
		},
		{
			_id: "3",
			message:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga unde eius rem, sed neque alias nam ipsum commodi facere quam architecto molestias illum ducimus error, cupiditate sint, illo tempora quis.",
			datePublication: new Date(),
			prediction_id: "68f39ca2e5611f91b1536c99",
			parentPublication_id: "1",
			user_id: "User3",
			likes: ["User1"],
		},
		{
			_id: "4",
			message:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga unde eius rem, sed neque alias nam ipsum commodi facere quam architecto molestias illum ducimus error, cupiditate sint, illo tempora quis.",
			datePublication: new Date(),
			prediction_id: "68f39ca2e5611f91b1536c99",
			parentPublication_id: "3",
			user_id: "User4",
			likes: [],
		},
		{
			_id: "2",
			message:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga unde eius rem, sed neque alias nam ipsum commodi facere quam architecto molestias illum ducimus error, cupiditate sint, illo tempora quis.",
			datePublication: new Date(),
			prediction_id: "68f39ca2e5611f91b1536c99",
			user_id: "User2",
			likes: [],
		},
		{
			_id: "5",
			message:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga unde eius rem, sed neque alias nam ipsum commodi facere quam architecto molestias illum ducimus error, cupiditate sint, illo tempora quis.",
			datePublication: new Date(),
			prediction_id: "68f39ca2e5611f91b1536c99",
			user_id: "User2",
			likes: [],
		},
	]);
	const [userBets, setUserBets] = useState<Record<string, number>>({});
	const [currentAmount, setCurrentAmount] = useState<number>(0);
	const [customAmount, setCustomAmount] = useState<number>(0);
	const [customAmountSelected, setCustomAmountSelected] = useState<boolean>(false);
	const [optionSelected, setOptionSelected] = useState<string | null>(null);

	const [toast, setToast] = useState<Toast | null>(null);

	const { id: predictionId = "" } = useParams<{ id: string }>();

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(username, token, setToast);
		setUser(u);
	};

	const fetchPredictionById = async (id: string) => {
		const predictionFetched = await PredictionController.getPredictionById(id, token, setToast);
		setPrediction({ ...predictionFetched } as PredictionWithThisVotesAndPublications);
		setOptions(predictionFetched?.options || {});

		const userBets =
			predictionFetched?.votes?.reduce(
				(acc: Record<string, number>, vote) => {
					acc[vote.option] = vote.amount || 0;
					return acc;
				},
				{} as Record<string, number>,
			) || {};

		setUserBets(userBets);

		if (predictionFetched?.options) {
			setAIPronostics(
				Object.fromEntries(
					Object.keys(predictionFetched.options).map((option) => [option, 0]),
				),
			);
		}
	};

	const clearToast = () => setToast(null);

	const onOptionSelect = (option: string) => {
		setOptionSelected(optionSelected === option ? null : option);
	};

	const onConfirmVoteClick = () => {
	};

	const addPublication = (newPublication: Publication) => {
		setPublications([...publications, newPublication]);
	};

	const toggleLike = (publicationId: string) => {
		const publication = publications.find((pub) => pub._id === publicationId);
		if (publication) {
			if (publication.likes.includes(username!)) {
				publication.likes = publication.likes.filter((user) => user !== username);
			} else {
				publication.likes.push(username!);
			}
			setPublications([...publications]);
		}
	}

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
					<CalendarClock strokeWidth={1.5} className="w-5 h-5 md:w-6"/>
					{prediction?.dateFin?.toLocaleDateString()}
				</div>
				<div className="text-sm md:text-base text-gray-400 mb-2">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae consequatur amet dolor corrupti
					pariatur eos, ipsa reprehenderit perspiciatis neque minus blanditiis cum porro commodi consectetur
					ab quae, dolorum natus illum.
				</div>
				<div className="h-50 md:h-100 border border-gray-700 rounded-lg p-4 md:p-8">
					<div className="h-full">
						<PredictionTimeline predictionId={predictionId} />
					</div>
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
				<div className="mt-3">
					<OptionGrid
						options={options}
						userBets={userBets}
						onOptionSelect={onOptionSelect}
						optionSelected={optionSelected}
						aiPronostics={aiPronostics}
					/>
				</div>
				<div className="mt-3">
					<ConfirmVote onClick={onConfirmVoteClick} />
				</div>
				<div className="mt-5">
					<WritePublication
						predictionId={predictionId}
						username={username ?? ""}
						placeholder={"Écrivez votre publication ..."}
						addPublication={addPublication}
					/>
				</div>
				<div className="mt-3">
					<PublicationList
						predictionId={predictionId}
						username={username ?? ""}
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
