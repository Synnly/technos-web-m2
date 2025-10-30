import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar.component";
import SearchBar from "../components/search/SearchBar";
import PredictionFilters from "../components/filters/PredictionFilters";
import type { FiltersState } from "../components/filters/types/filters.interface";
import type { Toast } from "../components/toast/Toast.interface";
import PredictionCard from "../components/predictions/PredictionCard";
import { PredictionController } from "../modules/prediction/prediction.controller";
import { userController } from "../modules/user/user.controller";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { PublicUser } from "../modules/user/user.interface";

function AllPredictions() {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [_, setToast] = useState<Toast | null>(null);
	const [___, setPoints] = useState<number>(0);
	const token = localStorage.getItem("token");
	const [predictions, setPredictions] = useState<any[]>([]);
	const [users, setUsers] = useState<Array<PublicUser>>([]);
	const [search, setSearch] = useState<string>("");
	const [filters, setFilters] = useState<FiltersState>({ dateRange: null });
	const [__, setLoading] = useState(false);
	const navigate = useNavigate();
	const { username } = useAuth();

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(username, token, setToast);
		setUser(u);
	};

	const fetchAllPredictions = async () => {
		setLoading(true);
		const validPredictions = await PredictionController.getAllValidPredictions(token, "1", "1000", setToast);
		const closedPredictions = await PredictionController.getAllClosedPredictions(token, "1", "1000", setToast);

		setPredictions([...validPredictions, ...closedPredictions]);
		setLoading(false);
	};
	const fetchAllUsers = async () => {
		const users = await userController.getAllUsers(token, setToast);
		setUsers(users);
	};

	const navToPrediction = (id: string) => {
		navigate(`/prediction/${id}`);
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

	const filtered = React.useMemo(() => {
		const q = (search || "").trim().toLowerCase();
		return (predictions || []).filter((p: any) => {
			if (q && !(p.title || "").toLowerCase().includes(q)) return false;

			if (filters?.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
				const from = new Date(filters.dateRange[0]);
				const to = new Date(filters.dateRange[1]);
				const d = new Date(p.dateFin);
				if (d < from || d > to) return false;
			}

			return true;
		});
	}, [predictions.reverse(), search, filters]);

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
				<div className="mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex-1">
							<SearchBar
								value={search}
								onSearch={(v) => setSearch(v)}
								className="bg-gray-800 text-white placeholder-gray-400 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-green-400 transition-all duration-300"
							/>
						</div>
						<div className="mt-2 sm:mt-0">
							<PredictionFilters
								value={filters}
								onChange={(s) => setFilters(s)}
								className="bg-gray-800 text-white rounded-xl shadow-sm p-2 hover:shadow-md transition-all duration-300"
							/>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{filtered.map((prediction) => (
						<PredictionCard
							key={prediction._id}
							id={prediction._id}
							title={prediction.title}
							author={users.find((u) => u._id === prediction.user_id)?.username}
							votes={prediction.nbVotes}
							comments={prediction.nbPublications}
							percent={prediction.percent}
							mostVotedOption={prediction.mostVotedOption}
							endsIn={prediction.dateFin.toString()}
							onClick={() => navToPrediction(prediction._id)}
						/>
					))}
				</div>
			</main>
		</div>
	);
}

export default AllPredictions;
