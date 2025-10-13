import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar.component";
import SearchBar from "../components/search/SearchBar";
import PredictionFilters from "../components/filters/PredictionFilters";
import type { FiltersState } from "../components/filters/types/filters.interface";
import type { Toast } from "../components/toast/Toast.interface";
import PredictionCard from "../components/predictions/PredictionCard";
import { PredictionController } from "../modules/prediction/prediction.controller";
import { userController } from "../modules/user/user.controller";

function AllPredictions() {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, ___] = useState<any>(null);
	const [_, setToast] = useState<Toast | null>(null);
	const [____, setOpen] = useState(false);
	const token = localStorage.getItem("token");
	const [predictions, setPredictions] = useState<any[]>([]);
	const [usersMap, setUsersMap] = useState<Record<string, string>>({});
	const [search, setSearch] = useState<string>("");
	const [filters, setFilters] = useState<FiltersState>({ dateRange: null });
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
	}, [predictions, search, filters]);

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
				<div className="mb-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<div className="flex-1 mr-2">
							<SearchBar
								value={search}
								onSearch={(v) => setSearch(v)}
							/>
						</div>
						<div>
							<PredictionFilters
								value={filters}
								onChange={(s) => setFilters(s)}
							/>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-white cursor-pointer">
					{filtered.map((prediction) => (
						<PredictionCard
							key={prediction._id}
							id={prediction._id}
							title={prediction.title}
							author={usersMap[prediction.user_id]}
							votes={prediction.nbVotes}
							comments={prediction.nbPublications}
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
