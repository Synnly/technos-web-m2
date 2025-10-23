import { IsNotEmpty, IsNumber, IsString, IsDate } from "class-validator";
import { Type } from 'class-transformer';

export class CreateVoteDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    prediction_id: string;

    @IsString()
    @IsNotEmpty()
    option: string;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    date: Date;

    @IsNotEmpty()
    user_id: string;

    constructor(partial: Partial<CreateVoteDto>) {
        Object.assign(this, partial);
    }
}
