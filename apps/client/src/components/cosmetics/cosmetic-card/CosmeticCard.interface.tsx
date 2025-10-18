export interface CosmeticCardProps {
	id: string;
	name: string;
	type: "badge" | "color";
	cost: number;
	isApplied: boolean;
	onApply: (id: string) => void;
}
