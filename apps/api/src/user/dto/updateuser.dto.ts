import { ArrayMaxSize, ArrayMinSize, IsDateString, IsPositive, IsString, IsStrongPassword } from "class-validator";

/**
 * DTO pour la mise à jour des informations d'un utilisateur.
 */
export class UpdateUserDto {
	@IsString()
	username: string;

	@IsStrongPassword({
		minLength: 8,
		minUppercase: 1,
		minLowercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	motDePasse?: string;

	@IsPositive()
	points?: number;

	@IsDateString()
	dateDerniereRecompenseQuotidienne?: Date | null;

	@IsString({ each: true })
	predictions?: string[];

	@IsString({ each: true })
	votes?: string[];

	@IsString()
	role?: string;

	@IsString({ each: true })
	cosmeticsOwned?: string[];

	@ArrayMaxSize(2)
	@ArrayMinSize(2)
	currentCosmetic?: (string | null)[];

	constructor(partial: Partial<UpdateUserDto>) {
		Object.assign(this, partial);
	}
}
