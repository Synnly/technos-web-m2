export interface Cosmetic {
	_id: string;
	name: string;
	cost: number;
	type: "badge" | "color";
	hexColor?: string;
}

export interface CreateCosmetic {
	name: string;
	cost: number;
	type: "badge" | "color";
	value: string;
}