import { Bot } from "lucide-react";

export interface OptionCardProps {
	name: string;
	points: number;
	userBet: number;
	onClick: (optionKey: string) => void;
	optionSelected?: string | null;
	aiPronostic?: number;
	result?: string;
}

const OptionCard: React.FC<OptionCardProps> = ({ name, points, userBet, onClick, optionSelected, aiPronostic, result }) => {
	const bgColor = result === name ? "bg-green-800/50" : optionSelected === name ? "bg-gray-700" : "bg-gray-800";
	const borderColor = result === name ? "border-green-700" : "border-gray-700";
	const textColor = result === name ? "text-green-400" : "text-white";
	return (
		<div
			className={`${bgColor} border ${borderColor} rounded-lg shadow-md transition-all duration-300 
        	${result ? "" : "hover:scale-105 active:scale-95 hover:shadow-xl cursor-pointer"}`}
			onClick={() => onClick(name)}
		>
			<div className="m-4 flex items-center justify-between">
				<div className={textColor}>
					<h1 className="font-semibold">{name}</h1>
					<div className="text-sm flex flex-row items-center gap-2">
						<Bot strokeWidth={1.5}/>
						<div>Pronostic IA : {aiPronostic ? `${aiPronostic} %` : "NA"}</div>
					</div>
				</div>
				<div>
					<p className={`${textColor} font-semibold`}>{points ?? 0} points</p>
					<p className={`${textColor} italic text-sm font-light`}>Misé {userBet ?? 0} points</p>
				</div>
			</div>
		</div>
	);
};

export default OptionCard;
