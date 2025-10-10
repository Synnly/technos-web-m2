import React from "react";
import {
	TrendingUpDown,
	Vote,
	ShoppingBag,
	Crown,
	CircleUser,
} from "lucide-react";
import { colorSchemes } from "../sidebar/navigation/color";

type Props = {
	user?: any;
};

export default function StatsGrid({ user }: Props) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-white">
			<div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
				<div className="flex items-center justify-between mb-2">
					<div
						className={`w-10 h-10 ${colorSchemes.blue.bg} rounded-lg flex items-center justify-center ${colorSchemes.blue.hoverBg} transition-colors`}
					>
						{React.createElement(TrendingUpDown, {
							className: `w-5 h-5  ${colorSchemes.blue.text}`,
						})}
					</div>
					<span className="text-lg md:text-xl font-bold">
						{user && user.predictions && user.predictions.length}
					</span>
				</div>
				<p className="text-gray-400 text-sm">Predictions</p>
			</div>

			<div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
				<div className="flex items-center justify-between mb-2">
					<div
						className={`w-10 h-10 ${colorSchemes.purple.bg} rounded-lg flex items-center justify-center ${colorSchemes.purple.hoverBg} transition-colors`}
					>
						{React.createElement(Vote, {
							className: `w-6 h-6  ${colorSchemes.purple.text}`,
						})}
					</div>
					<span className="text-lg md:text-xl font-bold">
						{user && user.votes.length}
					</span>
				</div>
				<p className="text-gray-400 text-sm">Votes</p>
			</div>

			<div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
				<div className="flex items-center justify-between mb-2">
					<div
						className={`w-10 h-10 ${colorSchemes.pink.bg} rounded-lg flex items-center justify-center ${colorSchemes.pink.hoverBg} transition-colors`}
					>
						{React.createElement(ShoppingBag, {
							className: `w-5 h-5  ${colorSchemes.pink.text}`,
						})}
					</div>
					<span className="text-lg md:text-xl font-bold">
						{user && user.cosmeticsOwned.length}
					</span>
				</div>
				<p className="text-gray-400 text-sm">Cosmétiques</p>
			</div>

			<div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
				<div className="flex items-center justify-between mb-2 content-center">
					<div
						className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
							user?.role === "user"
								? `${colorSchemes.green.bg} ${colorSchemes.green.hoverBg}`
								: `${colorSchemes.yellow.bg} ${colorSchemes.yellow.hoverBg}`
						}`}
					>
						{user?.role !== "user" ? (
							<Crown
								className={`w-5 h-5 ${colorSchemes.yellow.text}`}
							/>
						) : (
							<CircleUser
								className={`w-5 h-5 ${colorSchemes.green.text}`}
							/>
						)}
					</div>

					<span className="text-sm md:text-md font-bold text-center">
						{user && user.role == "user"
							? "Premium+ ?"
							: "Compte premium"}
					</span>
				</div>
			</div>
		</div>
	);
}
