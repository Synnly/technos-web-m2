import OptionCard from "./OptionCard";

interface OptionGridProps {
	options: Record<string, number>;
	userBets: Record<string, number>;
	onOptionSelect: (option: string) => void;
	optionSelected: string | null;
	aiPronostics: Record<string, number>;
	result?: string;
}

const OptionGrid: React.FC<OptionGridProps> = ({ options, userBets, onOptionSelect, optionSelected, aiPronostics, result }) => {
	const maxCols = Math.min(Object.keys(options).length, 3);
	return (
			<div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${maxCols} gap-2 md:gap-10`}>
			{Object.keys(options).map((optionKey) => (
				<OptionCard
					key={optionKey}
					name={optionKey}
					points={options[optionKey]}
					userBet={userBets[optionKey]}
					onClick={() => onOptionSelect(optionKey)}
					optionSelected={optionSelected}
					aiPronostic={aiPronostics[optionKey]}
					result={result}
				/>
			))}
		</div>
	);
};

export default OptionGrid;
