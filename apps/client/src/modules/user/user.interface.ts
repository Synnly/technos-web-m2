import type { Cosmetic } from "../cosmetic/cosmetic.interface";

export type Role = "user" | "admin" | "vip" | "premium" | "plus";

export interface User {
	_id: string;
	username: string;
	motDePasse?: string;
	points: number;
	dateDerniereRecompenseQuotidienne: string | null;
	predictions?: string[];
	votes?: string[];
	role: Role;
	cosmeticsOwned: string[];
	currentCosmetic: Array<string | Cosmetic | null>;
}
