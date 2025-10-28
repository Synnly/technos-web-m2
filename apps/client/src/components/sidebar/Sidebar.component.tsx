import DailyRewards from "./navigation/navigation-daily-reward/DailyRewards.component";
import NavigationItemComponent from "./navigation/navigation-item/NavigationItem.component";
import NavigationSectionComponent from "./navigation/navigation-section/NavigationSection.component";
import { getActions } from "./Sidebar.action";
import { ArrowBigLeft, ArrowBigRight, LogOut } from "lucide-react";
import { userController } from "../../modules/user/user.controller";
import type { SidebarProps } from "./Sidebar.interface";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import React from "react";

import Modal from "../modal/modal.component";
import GenericForm from "../form/Form.component";
import InputDatePicker from "../input/DatePicker/InputDatePicker.component";
import InputText  from "../input/Text/InputText.component";
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
	const Actions = getActions(() => setModalOpen(true));
	const [collapsed, setCollapsed] = React.useState(() => {
		const saved = localStorage.getItem("sidebar-collapsed");
		return saved ? JSON.parse(saved) : false;
	});
	React.useEffect(() => {
		if (onCollapsedChange) {
			onCollapsedChange(collapsed);
		}
		localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
	}, [collapsed, onCollapsedChange]);

	const toggleSidebar = () => {
		setCollapsed((prev: Boolean) => !prev);
	};

	const handleClick = () => {
		userController.claimDailyReward(
			user,
			token,
			setUser,
			setPoints,
			setToast,
		);
	};

	const handleLogout = () => {
		logout();
		navigate("/signin");
	};

	return (
		<aside
			className={`fixed left-0 top-0 min-h-screen transition-all duration-300 bg-gray-800 border-r border-gray-700 hidden lg:block ${
				collapsed ? "w-20" : "w-80"
			} overflow-hidden`}
		>
			<div className="p-4 flex flex-col min-h-screen">
				<nav className="space-y-2 flex-1 relative">
					<div
						onClick={toggleSidebar}
						className={
							collapsed
								? "text-gray-400 hover:text-white mb-4 flex justify-center"
								: "text-gray-400 hover:text-white mb-4 flex justify-end"
						}
					>
						{collapsed ? (
							<ArrowBigRight className="cursor-pointer w-7 h-7" />
						) : (
							<ArrowBigLeft className="cursor-pointer w-7 h-7" />
						)}
					</div>
					{Actions.map((section) => (
						<NavigationSectionComponent
							key={section.title}
							roles={section.roles}
							title={collapsed ? "" : section.title}
							items={section.items}
							collapsed={collapsed}
						/>
					))}

					{!collapsed && (
						<DailyRewards
							onClick={handleClick}
							pointdejaRecup={Boolean(
								user &&
									user.dateDerniereRecompenseQuotidienne &&
									new Date(
										user.dateDerniereRecompenseQuotidienne,
									).toDateString() ===
										new Date().toDateString(),
							)}
						/>
					)}

					<Modal
						isOpen={modalOpen}
						onClose={() => setModalOpen(false)}
					>
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
								const rawDate =
									values["date de fin"] ?? values.dateFin;
								const dateFin =
									rawDate &&
									typeof rawDate.toISOString === "function"
										? rawDate.toISOString()
										: rawDate;
								const payload = {
									title: values.title,
									description: values.description,
									dateFin,
									options: values.options,
								};
								const result =
									await PredictionController.createPrediction(
										payload,
										{
											username: user?.username,
											setToast: (msg: string) =>
												setToast({
													message: msg,
													type: "success",
												}),
											onClose: () => setModalOpen(false),
											fetchPredictions:
												onPredictionCreated
													? async () =>
															onPredictionCreated()
													: undefined,
										},
									);
								if (result.success && onPredictionCreated)
									onPredictionCreated();
							}}
						/>
					</Modal>

					<div className="absolute bottom-5">
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
		</aside>
	);
};

export default Sidebar;
