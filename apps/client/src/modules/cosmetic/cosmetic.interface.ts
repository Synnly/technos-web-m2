export interface Cosmetic {
	_id: string;
	name: string;
	cost: number;
	type: "badge" | "color";
	value?: string;
}
