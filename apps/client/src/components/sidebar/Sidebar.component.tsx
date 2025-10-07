import { useState } from "react";
import DailyRewards from "./navigation/navigation-daily-reward/DailyRewards.component";
import NavigationItemComponent from "./navigation/navigation-item/NavigationItem.component";
import NavigationSectionComponent from "./navigation/navigation-section/NavigationSection.component";
import Actions from "./Sidebar.action";
import { ArrowBigLeft, ArrowBigRight, LogOut } from "lucide-react";
import { userController } from "../../modules/user/user.controller";
import type { SidebarProps } from "./Sidebar.interface";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import React from "react";

const Sidebar: React.FC<SidebarProps> = ({
	user,
	token,
	setUser,
	setPoints,
	setToast,
}) => {
	const navigate = useNavigate();
	const { logout } = useAuth();

	const [collapsed, setCollapsed] = React.useState(() => {
		const saved = localStorage.getItem("sidebar-collapsed");
		return saved ? JSON.parse(saved) : false;
	});

	React.useEffect(() => {
		localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
	}, [collapsed]);

	const toggleSidebar = () => {
		setCollapsed((prev : Boolean) => !prev);
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
			className={`fixed left-0 top-0 h-full transition-all duration-300 bg-gray-800 border-r border-gray-700 overflow-visible 
        ${collapsed ? "w-20" : "w-80"}`}
		>
			<div className="p-4 flex flex-col h-full">
				<nav className="space-y-2 flex-1">
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

					<div className="pt-4 border-t border-gray-700">
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
