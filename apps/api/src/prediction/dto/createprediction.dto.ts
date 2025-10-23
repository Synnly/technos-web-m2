import {
	IsDate,
	IsNotEmpty,
	IsString,
	IsObject,
	MinLength,
	IsEnum,
	IsOptional,
	ValidateNested,
	IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
import { PredictionStatus } from "../prediction.schema";
import { IsFutureDate } from "../../validators/is-future-date.validator";

/**
 * DTO pour la création d'une prédiction.
 */
export class CreatePredictionDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	title: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsNotEmpty()
	@IsDate()
	@Type(() => Date)
	@IsFutureDate({ message: "La date de fin doit être supérieure ou égale à aujourd'hui" })
	dateFin: Date;

	@IsNotEmpty()
	@IsObject()
	options: Record<string, number>;

	@IsOptional()
	@IsEnum(PredictionStatus)
	status?: PredictionStatus;

	constructor(partial: Partial<CreatePredictionDto>) {
		Object.assign(this, partial);
	}
}
