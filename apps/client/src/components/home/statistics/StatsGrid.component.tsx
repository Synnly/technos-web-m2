import React from "react";
import {
	TrendingUpDown,
	Vote,
	ShoppingBag,
	Crown,
	CircleUser,
} from "lucide-react";

type Props = {
	user?: any;
};

export default function StatsGrid({ user }: Props) {
	return (
		<>
		<h1 className="text-white text-xl font-bold pb-6">Quelques informations sur vos activités</h1>
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-slate-100">
			<div className="bg-gradient-to-br from-indigo-700 to-indigo-600 rounded-lg p-4 shadow-md ring-1 ring-indigo-800 ">
				<div className="flex items-center justify-between mb-2">
					<div
						className={`w-11 h-11 bg-white/6 rounded-full flex items-center justify-center border border-white/70`}
					>
						{React.createElement(TrendingUpDown, {
							className: `w-5 h-5 text-white`
						})}
					</div>
					<span className="text-2xl md:text-3xl font-extrabold">
						{user && user.predictions && user.predictions.length}
					</span>
				</div>
				<p className="text-white/85 text-sm">Prédictions</p>
			</div>

			<div className="bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg p-4 shadow-md ring-1 ring-purple-700 ">
				<div className="flex items-center justify-between mb-2">
					<div
						className={`w-11 h-11 bg-white/6 rounded-full flex items-center justify-center border border-white/70`}
					>
						{React.createElement(Vote, {
							className: `w-5 h-5 text-white`,
						})}
					</div>
					<span className="text-2xl md:text-3xl font-extrabold">
						{user && user.votes && user.votes.length}
					</span>
				</div>
				<p className="text-white/85 text-sm">Votes</p>
			</div>

			<div className="bg-gradient-to-br from-pink-600 to-pink-400 rounded-lg p-4 shadow-md ring-1 ring-pink-700 ">
				<div className="flex items-center justify-between mb-2">
					<div
						className={`w-11 h-11 bg-white/6 rounded-full flex items-center justify-center border border-white/70`}
					>
						{React.createElement(ShoppingBag, {
							className: `w-5 h-5 text-white`,
						})}
					</div>
					<span className="text-2xl md:text-3xl font-extrabold">
						{user && user.cosmeticsOwned && user.cosmeticsOwned.length}
					</span>
				</div>
				<p className="text-white/85 text-sm">Cosmétiques</p>
			</div>

			<div className="bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-lg p-4 shadow-md ring-1 ring-emerald-700 ">
				<div className="flex items-center justify-between mb-2 content-center">
					<div
						className={`w-11 h-11 rounded-full flex items-center justify-center border border-white/70`}
					>
						{user?.role !== "user" ? (
							<Crown className={`w-5 h-5 text-white`} />
						) : (
							<CircleUser className={`w-5 h-5 text-white`} />
						)}
					</div>

					<span className="text-sm md:text-md font-semibold text-white text-center">
						{user && user.role == "user" ? "Compte standard" : "Compte premium"}
					</span>
				</div>
			</div>
		</div>
		</>
	);
	
}
