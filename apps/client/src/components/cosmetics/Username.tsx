import React from "react";
import { renderWithEmojis } from "./emoji";

interface UsernameProps {
	username?: string;
	color?: string;
	badge?: string;
}

const Username: React.FC<UsernameProps> = ({ username, color, badge }) => {
	return (
		<span style={{ color: color ?? "white" }} className="w-fit">
			{badge && renderWithEmojis(badge)} {username ?? ""}
		</span>
	);
};
export default Username;
