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
import type { User } from "../modules/user/user.interface";

function AllPredictions() {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [_, setToast] = useState<Toast | null>(null);	
	const [___, setPoints] = useState<number>(0);
	const token = localStorage.getItem("token");
	const [predictions, setPredictions] = useState<any[]>([]);
	const [users, setUsers] = useState<Array<User>>([]);
	const [search, setSearch] = useState<string>("");
	const [filters, setFilters] = useState<FiltersState>({ dateRange: null });
	const [__, setLoading] = useState(false);
	const navigate = useNavigate();
	const { username } = useAuth();

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(
			username,
			token,
			setToast,
		);
		setUser(u);
	};

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

			if (
				filters?.dateRange &&
				filters.dateRange[0] &&
				filters.dateRange[1]
			) {
				const from = new Date(filters.dateRange[0]);
				const to = new Date(filters.dateRange[1]);
				const d = new Date(p.dateFin);
				if (d < from || d > to) return false;
			}
			
			return true;
		});
	}, [predictions.reverse(), search, filters]);

	return (
		<>
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
				className={`flex-1 transition-all h-screen bg-gray-900 backdrop-blur-sm
    ${sidebarCollapsed ? "ml-20 p-6 sm:p-8 md:p-10" : "ml-0 lg:ml-80 p-6 sm:p-8 md:p-10"}`}
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
		</>
	);
}

export default AllPredictions;
