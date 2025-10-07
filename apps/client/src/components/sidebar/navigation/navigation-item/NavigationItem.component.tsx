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
    path
}) => {
    const colors = colorSchemes[colorScheme as keyof typeof colorSchemes];
    const navigate = useNavigate();
    return (
        <button
        id={id}
        onClick={() => navigate(path)}
        className="!bg-transparent w-full flex items-center space-x-3 px-4 py-3 ronded-lg transition-colors group cursor-pointer">
            <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center ${colors.hoverBg} transition-colors`}>
                <span className={colors.text}>{icon}</span>
            </div>
            <div className="text-left">
                <p className="block font-medium text-white">{title}</p>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
        </button>

     );
}

export default NavigationItemComponent;