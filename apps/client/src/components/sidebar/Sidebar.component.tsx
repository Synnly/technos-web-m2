import DailyRewards from "./navigation/navigation-daily-reward/DailyRewards.component";
import NavigationItemComponent from "./navigation/navigation-item/NavigationItem.component";
import NavigationSectionComponent from "./navigation/navigation-section/NavigationSection.component";
import { getActions } from "./Sidebar.action";
import { ArrowBigLeft, ArrowBigRight, ArrowBigUp, LogOut, Menu } from "lucide-react";
import { userController } from "../../modules/user/user.controller";
import type { SidebarProps } from "./Sidebar.interface";
import { useAuth } from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";

import Modal from "../modal/modal.component";
import GenericForm from "../form/Form.component";
import InputDatePicker from "../input/DatePicker/InputDatePicker.component";
import InputText from "../input/Text/InputText.component";
import InputOptions from "../input/Options/InputOptions.component";
import { PredictionController } from "../../modules/prediction/prediction.controller";

const Sidebar: React.FC<SidebarProps> = ({
	user,
	token,
	setUser,
	setPoints,
	setToast,
	onPredictionCreated,
	onCollapsedChange,
}) => {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const [modalOpen, setModalOpen] = React.useState(false);
	const Actions = getActions(() => {setModalOpen(true)});
	const [collapsed, setCollapsed] = React.useState(() => {
		const saved = localStorage.getItem("sidebar-collapsed");
		return saved ? JSON.parse(saved) : false;
	});
	const [pointdejaRecup, setPointdejaRecup] = React.useState<boolean>(
		Boolean(
			user?.dateDerniereRecompenseQuotidienne &&
				new Date().toDateString() === new Date(user.dateDerniereRecompenseQuotidienne).toDateString(),
		),
	);
	const location = useLocation();

	React.useEffect(() => {
		if (onCollapsedChange) {
			onCollapsedChange(collapsed);
		}
		localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
	}, [collapsed, onCollapsedChange]);

	React.useEffect(() => {
		setPointdejaRecup(
			Boolean(
				user?.dateDerniereRecompenseQuotidienne &&
					new Date().toDateString() === new Date(user.dateDerniereRecompenseQuotidienne).toDateString(),
			),
		);
	}, [user]);

	React.useEffect(() => {
		const isSmall = window.matchMedia("(max-width: 1023px)").matches;
		if (isSmall) setCollapsed(true);
	}, [location.pathname]);

	const toggleSidebar = () => {
		setCollapsed((prev: Boolean) => !prev);
	};

	const handleClick = () => {
		userController.claimDailyReward(user, token, setUser, setPoints, setToast, setPointdejaRecup);
	};

	const handleLogout = () => {
		logout();
		navigate("/signin");
	};

	return (
		<div
			className={`fixed lg:block left-0 top-0 w-full lg:h-full transition-all duration-150 ease-out overflow-hidden 
			lg:overflow-visible bg-gray-800 border-r border-gray-700 z-99
        	${collapsed ? "max-h-11 lg:max-h-full lg:w-20" : "max-h-screen lg:max-h-full lg:w-80 shadow-xl lg:shadow-none"}`}
		>
			<nav className={`flex flex-col h-full justify-between ${collapsed ? "p-2 md:p-2 lg:pt-8" : "p-6 md:p-8"}`}>
				<div className="h-fit">
					<div
						onClick={toggleSidebar}
						className={
							collapsed
								? "text-gray-400 hover:text-white lg:mb-4 flex justify-center"
								: "text-gray-400 hover:text-white lg:mb-4 flex justify-end"
						}
					>
						{collapsed ? (
							<>
								<ArrowBigRight className="cursor-pointer w-7 h-7 hidden lg:block" />
								<Menu className="cursor-pointer w-7 h-7 lg:hidden" />
							</>
						) : (
							<>
								<ArrowBigLeft className="cursor-pointer w-7 h-7 hidden lg:block" />
								<ArrowBigUp className="cursor-pointer w-7 h-7 lg:hidden" />
							</>
						)}
					</div>
					<div className={`${collapsed ? "hidden lg:block" : ""}`}>
						{Actions.map((section) => (
							<NavigationSectionComponent
								key={section.title}
								roles={section.roles}
								title={collapsed ? "" : section.title}
								items={section.items}
								collapsed={collapsed}
							/>
						))}

						{!collapsed && <DailyRewards onClick={handleClick} pointdejaRecup={pointdejaRecup} />}

						<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
							<GenericForm
								form={undefined}
								title="Création d'une prédiction"
								fields={[
									{
										name: "title",
										label: "Titre",
										component: InputText,
										componentProps: { placeholder: "Titre" },
										formItemProps: {
											rules: [{ required: true }],
										},
									},
									{
										name: "description",
										label: "Description",
										component: InputText,
										componentProps: {
											placeholder: "Description",
										},
									},
									{
										name: "dateFin",
										label: "Date de fin",
										component: InputDatePicker,
									},
									{
										name: "options",
										label: "Options",
										component: InputOptions,
									},
								]}
								onFinish={async (values: any) => {
									const dateFin = new Date(values.dateFin);
									const dateFinStr = new Date(dateFin.getTime() + 24 * 10 * 60000)
										.toISOString();

									const payload = {
										title: values.title,
										description: values.description,
										dateFin : dateFinStr,
										options: values.options,
									};
									const result = await PredictionController.createPrediction(
										token,
										payload,
										{
											username: user?.username,
											onClose: () => setModalOpen(false),
											fetchPredictions: onPredictionCreated
												? async () => onPredictionCreated()
												: undefined,
										},
										setToast,
									);
									if (result.success && onPredictionCreated) onPredictionCreated();
								}}
							/>
						</Modal>
					</div>
				</div>
				<div className={`${collapsed ? "hidden lg:block" : ""}`}>
					<NavigationItemComponent
						id="disconnect"
						icon={<LogOut className="w-5 h-5" />}
						title="Déconnexion"
						description="Tu nous quitte déjà ?"
						colorScheme="red"
						path=""
						onClick={handleLogout}
						collapsed={collapsed}
					/>
				</div>
			</nav>
		</div>
	);
};

export default Sidebar;
