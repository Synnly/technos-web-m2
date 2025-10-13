export interface PredictionCardProps {
	id: string;
	title: string;
	author?: string;
	votes?: string | number;
	comments?: string | number;
	percent?: number;
	mostVotedOption?: string;
	endsIn?: string;
	onClick?: (id: string) => void;
	className?: string;
}
