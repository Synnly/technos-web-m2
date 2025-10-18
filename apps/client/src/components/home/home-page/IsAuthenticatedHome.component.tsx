import Header from "../header/Header.component";
import StatsGrid from "../statistics/StatsGrid.component";
import XPSection from "../statistics/XPSection.component";
import PredictionsSection from "../predictions/PredictionsSection.component";
import Sidebar from "../../sidebar/Sidebar.component";
import ToastComponent from "../../toast/Toast.component";
import type { AuthenticatedHomeProps } from "../types/AuthenticatedHome.type";

const IsAuthenticatedHome = ({
	user,
	username,
	token,
	sidebarCollapsed,
	setSidebarCollapsed,
	toast,
	setToast,
	predictions,
	usersMap,
	handlePredictionClick,
	fetchAllPredictions,
	setPoints,
	setUser,
}: AuthenticatedHomeProps) => {
	const clearToast = () => setToast(null);

	return (
		<div className="bg-gray-900 mx-auto px-6 py-8 w-full min-h-screen  flex flex-col">
			<Sidebar
				user={user}
				token={token!}
				setUser={setUser}
				setPoints={setPoints}
				setToast={setToast}
				onPredictionCreated={fetchAllPredictions}
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
};

export default IsAuthenticatedHome;
