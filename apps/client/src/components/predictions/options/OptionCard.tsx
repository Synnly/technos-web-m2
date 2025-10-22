import { Bot } from "lucide-react";

export interface OptionCardProps {
	name: string;
	points: number;
	userBet: number;
	onClick: (optionKey: string) => void;
	optionSelected?: string | null;
	aiPronostic?: number;
}

const OptionCard: React.FC<OptionCardProps> = ({ name, points, userBet, onClick, optionSelected, aiPronostic }) => {
	return (
		<div
			className={`bg-gray-${optionSelected === name ? "700" : "800"} border border-gray-700 rounded-lg cursor-pointer shadow-md
        transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl`}
			onClick={() => onClick(name)}
		>
			<div className="m-4 flex items-center justify-between">
				<div className="text-white">
					<h1 className="font-semibold">{name}</h1>
					<div className="text-sm flex flex-row items-center gap-2">
						<Bot strokeWidth={1.5}/>
						<div>Pronostic IA : {aiPronostic ?? "NA"} %</div>
					</div>
				</div>
				<div>
					<p className="text-white font-semibold">{points ?? 0} points</p>
					<p className="text-white italic text-sm font-light">Misé {userBet ?? 0} points</p>
				</div>
			</div>
		</div>
	);
};

export default OptionCard;
