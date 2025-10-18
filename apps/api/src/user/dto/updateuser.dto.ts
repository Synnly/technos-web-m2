import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsDate,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsStrongPassword,
	Min,
} from "class-validator";
import { IsStringOrNull } from "../../validators/isStringOrNull.validator";

/**
 * DTO pour la mise à jour des informations d'un utilisateur.
 */
export class UpdateUserDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsOptional()
	@IsStrongPassword({
		minLength: 8,
		minUppercase: 1,
		minLowercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	motDePasse?: string;

	@IsOptional()
	@Min(0)
	points?: number;

	@IsOptional()
	@IsDate()
	dateDerniereRecompenseQuotidienne?: Date | null;

	@IsOptional()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	@IsArray()
	predictions?: string[];

	@IsOptional()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	@IsArray()
	votes?: string[];

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	role?: string;

	@IsOptional()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	@IsArray()
	cosmeticsOwned?: string[];

	@IsOptional()
	@IsArray()
	@ArrayMaxSize(2)
	@ArrayMinSize(2)
	@IsStringOrNull({ each: true })
	currentCosmetic?: (string | null)[];

	constructor(partial: Partial<UpdateUserDto>) {
		Object.assign(this, partial);
	}
}
