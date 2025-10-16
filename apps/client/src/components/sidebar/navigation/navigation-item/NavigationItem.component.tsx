import React, { useRef, useState, useEffect } from "react";
import type { NavigationItemProps } from "./NavigationItem.interface";
import { colorSchemes } from "../color";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

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
	const btnRef = useRef<HTMLButtonElement>(null);

	const [tooltipPos, setTooltipPos] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [showTooltip, setShowTooltip] = useState(false);

	useEffect(() => {
		if (collapsed && showTooltip && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();
			setTooltipPos({
				top: rect.top + rect.height / 2,
				left: rect.right + 12,
			});
		}
	}, [collapsed, showTooltip]);

	return (
		<div className="relative group">
			<button
				ref={btnRef}
				id={id}
				onClick={path ? () => navigate(path) : onClick}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				className={`!bg-transparent w-full flex items-center py-3 rounded-lg transition-colors cursor-pointer 
          ${collapsed ? "justify-center space-x-0" : "space-x-3"} hover:bg-gray-800`}
			>
				<div
					className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.hoverBg} transition-colors`}
				>
					<span className={`${colors.text}`}>{icon}</span>
				</div>

				{!collapsed && (
					<div className="text-left">
						<p className="block font-medium text-white leading-tight">
							{title}
						</p>
						<p className="text-xs text-gray-400 leading-tight">
							{description}
						</p>
					</div>
				)}
			</button>

			{collapsed &&
				showTooltip &&
				tooltipPos &&
				createPortal(
					<div
						className="fixed z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-700 text-white text-sm rounded-md px-3 py-2 shadow-xl transition-opacity duration-200"
						style={{
							top: `${tooltipPos.top}px`,
							left: `${tooltipPos.left}px`,
							transform: "translateY(-50%)",
						}}
					>
						<span className="font-medium">{title}</span>
						{description && (
							<p className="text-gray-400 text-xs mt-1 max-w-[200px] leading-snug">
								{description}
							</p>
						)}
					</div>,
					document.body,
				)}
		</div>
	);
};

export default NavigationItemComponent;
