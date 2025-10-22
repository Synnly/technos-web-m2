export interface CosmeticCardProps {
	id: string;
	name: string;
	type: "badge" | "color";
	isApplied: boolean;
	onApply: (id: string) => void;
}
