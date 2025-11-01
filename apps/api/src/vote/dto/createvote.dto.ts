import { IsNotEmpty, IsNumber, IsString, IsDate, IsMongoId } from "class-validator";
import { Type, Transform } from "class-transformer";

export class CreateVoteDto {
	@IsNumber()
	@IsNotEmpty()
	amount: number;

	@IsMongoId()
	@IsNotEmpty()
	@Transform(({ value }) => (value === "" ? undefined : value))
	prediction_id: string;

	@IsString()
	@IsNotEmpty()
	option: string;

	@IsDate()
	@IsNotEmpty()
	@Type(() => Date)
	date: Date;

	@IsMongoId()
	@IsNotEmpty()
	@Transform(({ value }) => (value === "" ? undefined : value))
	user_id: string;

	constructor(partial: Partial<CreateVoteDto>) {
		Object.assign(this, partial);
	}
}
