import { IsNotEmpty, IsString, IsOptional, IsArray, IsDate, IsMongoId } from "class-validator";
import { Type, Transform } from "class-transformer";
import { IsFutureDate } from "../../validators/is-future-date.validator";

export class CreatePublicationDto {
	@IsString()
	@IsNotEmpty()
	message: string;

	@IsDate()
	@IsNotEmpty()
	@Type(() => Date)
	@IsFutureDate({ message: "La date de publication doit être supérieure ou égale à aujourd'hui" })
	datePublication: Date;

	@IsNotEmpty()
	@IsMongoId()
	prediction_id: string;

	@IsOptional()
	@Transform(({ value }) => (value === "" ? undefined : value))
	@IsMongoId()
	parentPublication_id?: string;

	@IsNotEmpty()
	@IsMongoId()
	user_id: string;

	@IsOptional()
	@IsArray()
	@IsNotEmpty({ each: true })
	likes?: string[];

	constructor(partial: Partial<CreatePublicationDto>) {
		Object.assign(this, partial);
	}
}
