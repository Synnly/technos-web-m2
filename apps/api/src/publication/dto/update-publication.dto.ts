import { IsOptional, IsString, IsArray, IsNotEmpty, IsDate } from "class-validator";
import { Type, Transform } from "class-transformer";
import { IsFutureDate } from "../../validators/is-future-date.validator";

export class UpdatePublicationDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	message?: string;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	@IsFutureDate({ message: "La date de publication doit être supérieure ou égale à aujourd'hui" })
	datePublication?: Date;

	@IsOptional()
	prediction_id?: string;

	@IsOptional()
	@Transform(({ value }) => (value === "" ? undefined : value))
	parentPublication_id?: string;

	@IsOptional()
	user_id?: string;

	@IsOptional()
	@IsArray()
	@IsNotEmpty({ each: true })
	likes?: string[];

	constructor(partial: Partial<UpdatePublicationDto>) {
		Object.assign(this, partial);
	}
}
