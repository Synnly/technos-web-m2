import Header from "../header/Header.component";
import StatsGrid from "../statistics/StatsGrid.component";
import XPSection from "../statistics/XPSection.component";
import PredictionsSection from "../predictions/PredictionsSection.component";
import Sidebar from "../../sidebar/Sidebar.component";
import ToastComponent from "../../toast/Toast.component";
import type { AuthenticatedHomeProps } from "../types/AuthenticatedHome.type";
import type { Cosmetic } from "../../../modules/cosmetic/cosmetic.interface";
import CosmeticController from "../../../modules/cosmetic/cosmetic.controller";
import { useEffect } from "react";
import React from "react";

const IsAuthenticatedHome = ({
	user,
	username,
	token,
	sidebarCollapsed,
	setSidebarCollapsed,
	toast,
	setToast,
	predictions,
	users,
	handlePredictionClick,
	fetchAllPredictions,
	setPoints,
	setUser,
}: AuthenticatedHomeProps) => {
	const [cosmetics, setCosmetics] = React.useState<Cosmetic[]>([]);
	const clearToast = () => setToast(null);

	const fetchAllCosmetics = async () => {
		const cosmeticsFetched = await CosmeticController.getAllCosmetics(token, setToast);
		setCosmetics(cosmeticsFetched);
	};

	useEffect(() => {
		fetchAllCosmetics();
	}, []);

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
			{toast && <ToastComponent message={toast.message!} type={toast.type!} onClose={clearToast} />}

			<main
				className={`mx-5 lg:mx-20 py-8 pt-19 ${
					sidebarCollapsed
						? "flex-1 p-2 sm:p-4 md:p-6 md:pt-19 lg:pt-6 lg:ml-40 transition-all"
						: "flex-1 p-2 sm:p-4 md:p-6 lg:ml-100"
				}`}
			>
				<Header username={username} user={user} />
				<StatsGrid user={user} />
				<XPSection user={user} />
				<PredictionsSection
					predictions={predictions}
					users={users}
					onPredictionClick={handlePredictionClick}
					cosmetics={cosmetics}
				/>
			</main>
		</div>
	);
};

export default IsAuthenticatedHome;
