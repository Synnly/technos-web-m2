import { User } from "../user.schema";

/**
 * DTO pour transférer les données utilisateur.
 * Expose uniquement les champs nécessaires et évite d'exposer des informations sensibles.
 */
export class UserDto {
	_id: string;
	username: string;
	points: number;
	dateDerniereRecompenseQuotidienne: Date | null;
	predictions: string[];
	votes: string[];
	role: string;
	cosmeticsOwned: string[];
	currentCosmetic: (string | null)[];

	constructor(user: User) {
		this._id = user._id;
		this.username = user.username;
		this.points = user.points;
		this.dateDerniereRecompenseQuotidienne = user.dateDerniereRecompenseQuotidienne;
		this.predictions = user.predictions.map((prediction) => prediction._id);
		this.votes = user.votes.map((vote) => vote._id);
		this.role = user.role;
		this.cosmeticsOwned = user.cosmeticsOwned;
		this.currentCosmetic = user.currentCosmetic;
	}
}
