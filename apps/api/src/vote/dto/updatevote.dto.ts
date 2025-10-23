import { IsOptional, IsNumber, IsString, IsDate, IsMongoId } from "class-validator";
import { Type, Transform } from "class-transformer";

export class UpdateVoteDto {
	@IsOptional()
	@IsNumber()
	amount?: number;

	@IsOptional()
	@IsMongoId()
	@Transform(({ value }) => (value === "" ? undefined : value))
	prediction_id?: string;

	@IsOptional()
	@IsString()
	option?: string;

	@IsOptional()
	@IsDate()
	@Transform(({ value }) => (value ? new Date(value) : value))
	date?: Date;

	@IsOptional()
	@IsMongoId()
	@Transform(({ value }) => (value === "" ? undefined : value))
	user_id?: string;

	constructor(partial: Partial<UpdateVoteDto>) {
		Object.assign(this, partial);
	}
}
