export type Role = "user" | "admin" | "vip" | "premium" | "plus";

export interface User {
	_id: string;
	username: string;
	points: number;
	dateDerniereRecompenseQuotidienne: Date | null;
	predictions: string[];
	votes: string[];
	role: Role;
	cosmeticsOwned: string[];
	currentCosmetic: (string | null)[];
}

export interface PublicUser {
	_id: string;
	username: string;
	currentCosmetic: string[];
}
