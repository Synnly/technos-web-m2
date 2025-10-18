export interface OptionCardProps {
	name: string;
	points: number;
	userBet?: number;
}

const OptionCard: React.FC<OptionCardProps> = ({ name, points, userBet }) => {
	return (
		<div
			className="bg-gray-800 border border-gray-700 rounded-lg cursor-pointer shadow-md
        transition-all duration-300 hover:scale-[1.025] hover:shadow-xl"
		>
			<div className="m-4 flex items-center justify-between">
				<h1 className="text-white font-semibold">{name}</h1>
				<div>
					<p className="text-white font-semibold">{points ?? 0} points</p>
					<p className="text-white italic text-sm font-light">Misé {userBet ?? 0} points</p>
				</div>
			</div>
		</div>
	);
};

export default OptionCard;
