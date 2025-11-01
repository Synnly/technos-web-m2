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
import CosmeticController from "../modules/cosmetic/cosmetic.controller";
import type { Cosmetic } from "../modules/cosmetic/cosmetic.interface";
import Pagination from "../components/pagination/Pagination";

function AllPredictions() {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [_, setToast] = useState<Toast | null>(null);
	const [___, setPoints] = useState<number>(0);
	const token = localStorage.getItem("token");
	const [predictions, setPredictions] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [totalItemsEstimated, setTotalItemsEstimated] = useState<number>(0);
	const [totalCount, setTotalCount] = useState<number | null>(null);
	const [users, setUsers] = useState<Array<PublicUser>>([]);
	const [search, setSearch] = useState<string>("");
	const [filters, setFilters] = useState<FiltersState>({ dateRange: null });
	const [__, setLoading] = useState(false);
	const [cosmetics, setCosmetics] = React.useState<Cosmetic[]>([]);
	const navigate = useNavigate();
	const { username } = useAuth();

	const fetchUserByUsername = async (username: string) => {
		const u = await userController.getUserByUsername(username, token, setToast);
		setUser(u);
	};

	const fetchAllPredictions = async (page: number = currentPage) => {
		setLoading(true);
		const requestLimit = Math.max(1, pageSize);
		let accumulated: any[] = [];
		let moreValid = true;
		let moreClosed = true;
		const maxIterations = 20;
		let i = 1;
		while (accumulated.length < page * pageSize && (moreValid || moreClosed) && i <= maxIterations) {
			const [validPage, closedPage] = await Promise.all([
				PredictionController.getAllValidPredictions(token, String(i), String(requestLimit), setToast),
				PredictionController.getAllClosedPredictions(token, String(i), String(requestLimit), setToast),
			]);
			if (validPage.length < requestLimit) moreValid = false;
			if (closedPage.length < requestLimit) moreClosed = false;
			accumulated = [...accumulated, ...validPage, ...closedPage];
			i += 1;
		}

		accumulated.sort((a: any, b: any) => new Date(b.dateFin).getTime() - new Date(a.dateFin).getTime());

		setPredictions(accumulated);

		if (!moreValid && !moreClosed) {
			setTotalItemsEstimated(accumulated.length);
		} else if (accumulated.length < page * pageSize) {
			setTotalItemsEstimated(accumulated.length);
		} else {
			setTotalItemsEstimated((page + 1) * pageSize - 1);
		}

		setLoading(false);
	};
	const fetchAllUsers = async () => {
		const users = await userController.getAllUsers(token, setToast);
		setUsers(users);
	};

	const navToPrediction = (id: string) => {
		navigate(`/prediction/${id}`);
	};

	const fetchAllCosmetics = async () => {
		const cosmeticsFetched = await CosmeticController.getAllCosmetics(token, setToast);
		setCosmetics(cosmeticsFetched);
	};

	const getPredictionsCount = async () => {
		if (!token) {
			setTotalCount(null);
			return;
		}
		try {
			const data = await PredictionController.getPredictionsCount(token, setToast);
			if (data && typeof data.totalCount === "number") {
				setTotalCount(data.totalCount);
			} else {
				setTotalCount(0);
			}
		} catch (e) {
			setTotalCount(null);
		}
	};

	useEffect(() => {
		fetchAllCosmetics();
	}, []);

	// compute a stable total count from server when token changes

	useEffect(() => {
		fetchAllUsers();
		fetchAllPredictions(currentPage);
	}, [token, currentPage, pageSize]);

	useEffect(() => {
		if (username) {
			fetchUserByUsername(username);
			setPoints(user?.points || 0);
		}
	}, [username]);

	useEffect(() => {
		getPredictionsCount();
	}, [token]);


	const filtered = React.useMemo(() => {
		const q = (search || "").trim().toLowerCase();
		const preds = [...(predictions || [])].reverse();
		return preds.filter((p: any) => {
			if (q && !(p.title || "").toLowerCase().includes(q)) return false;

			if (filters?.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
				const from = new Date(filters.dateRange[0]);
				const to = new Date(filters.dateRange[1]);
				const d = new Date(p.dateFin);
				if (d < from || d > to) return false;
			}

			return true;
		});
	}, [predictions, search, filters]);

	const totalItems = totalCount ?? totalItemsEstimated;
	const currentPageClamped = Math.max(1, Math.min(currentPage, Math.max(1, Math.ceil(totalItems / pageSize))));
	const paginated = React.useMemo(() => {
		const start = (currentPageClamped - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, currentPageClamped, pageSize]);

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
					{paginated.map((prediction) => (
						<PredictionCard
							key={prediction._id}
							id={prediction._id}
							title={prediction.title}
							author={users.find((user) => user._id === (prediction.user_id as any))}
							votes={prediction.nbVotes}
							comments={prediction.nbPublications}
							percent={prediction.percent}
							mostVotedOption={prediction.mostVotedOption}
							endsIn={prediction.dateFin.toString()}
							onClick={navToPrediction}
							status={prediction.status}
							result={prediction.result}
							cosmetics={cosmetics.filter((cosmetic) =>
								users
									.find((user) => user._id === (prediction.user_id as any))
									?.currentCosmetic.includes(cosmetic._id),
							)}
						/>
					))}
				</div>

				<Pagination
					totalItems={totalItems}
					currentPage={currentPageClamped - 1}
					pageSize={pageSize}
					onPageChange={(p: number) => setCurrentPage(p + 1)}
					onPageSizeChange={(s: number) => {
						setPageSize(s);
						setCurrentPage(1);
					}}
					className="mt-6"
				/>
			</main>
		</div>
	);
}

export default AllPredictions;
