import { IsOptional, IsString, IsDate, IsObject, MinLength, IsEnum } from "class-validator";
import { PredictionStatus } from "../prediction.schema";
import { Type } from "class-transformer";
import { IsFutureDate } from "../../validators/is-future-date.validator";

/**
 * DTO pour la mise à jour d'une prédiction.
 */
export class UpdatePredictionDto {
	@IsOptional()
	@IsString()
	@MinLength(3)
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	@IsFutureDate({ message: "La date de fin doit être supérieure ou égale à aujourd'hui" })
	dateFin?: Date;

	@IsOptional()
	@IsObject()
	options?: Record<string, number>;

	@IsOptional()
	@IsEnum(PredictionStatus)
	status?: PredictionStatus;

	@IsOptional()
	@IsString()
	result?: string;

	constructor(partial: Partial<UpdatePredictionDto>) {
		Object.assign(this, partial);
	}
}
