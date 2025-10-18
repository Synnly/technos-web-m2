import { max } from "date-fns";
import OptionCard from "./OptionCard";

interface OptionGridProps {
    options: Record<string, number>;
    userBets: Record<string, number>;
}

const OptionGrid: React.FC<OptionGridProps> = ({ options, userBets }) => {
    const maxCols = Math.min(Object.keys(options).length, 3);
	return (
		<div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${maxCols} gap-10`}>
			{Object.keys(options).map((optionKey) => (
				<OptionCard key={optionKey} name={optionKey} points={options[optionKey]} userBet={userBets[optionKey]} />
			))}
		</div>
	);
};

export default OptionGrid;
