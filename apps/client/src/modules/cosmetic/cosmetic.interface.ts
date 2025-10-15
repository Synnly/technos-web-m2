export interface Cosmetic {
	_id: string;
	name: string;
	cost: number;
	type: "badge" | "color";
	hexColor?: string;
}
