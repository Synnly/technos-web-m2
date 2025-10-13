export interface PredictionCardProps {
	id: string;
	title: string;
	author?: string;
	votes?: string | number;
	comments?: string | number;
	percent?: number;
	endsIn?: string;
	onClick?: (id: string) => void;
	className?: string;
}
