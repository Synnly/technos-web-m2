import React from "react";
import type { NavigationItemProps } from "./NavigationItem.interface";
import { colorSchemes } from "../color";
import { useNavigate } from "react-router-dom";

const NavigationItemComponent: React.FC<NavigationItemProps> = ({
	id,
	icon,
	title,
	description,
	colorScheme,
	path,
	collapsed,
	onClick,
}) => {
	const colors = colorSchemes[colorScheme as keyof typeof colorSchemes];
	const navigate = useNavigate();

	return (
		<div className="relative group">
			<button
				id={id}
				onClick={path ? () => navigate(path) : onClick}
				className={`!bg-transparent w-full flex items-center py-3 rounded-lg transition-colors cursor-pointer 
                ${collapsed ? "justify-center space-x-0" : "space-x-3"}`}
			>
				<div
					className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.hoverBg} transition-colors`}
				>
					<span className={`${colors.text}`}>{icon}</span>
				</div>

				{!collapsed && (
					<div className="text-left">
						<p className="block font-medium text-white">{title}</p>
						<p className="text-xs text-gray-400">{description}</p>
					</div>
				)}
			</button>

			{collapsed && (
				<div
					className="absolute left-full top-1/2 -translate-y-1/2 ml-3 
						bg-gray-900 text-white text-sm rounded-lg px-3 py-2
						opacity-0 group-hover:opacity-100 pointer-events-none
						whitespace-nowrap shadow-lg transition-opacity duration-200"
				>
					<span className="font-semibold">{title}</span>
					{description && (
						<p className="text-gray-400 text-xs mt-1">
							{description}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default NavigationItemComponent;
