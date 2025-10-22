import { IsNotEmpty, IsNumber, IsString, IsDateString } from "class-validator";
import { Types } from "mongoose";

export class CreateVoteDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    prediction_id: Types.ObjectId | string;

    @IsString()
    @IsNotEmpty()
    option: string;

    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsNotEmpty()
    user_id: Types.ObjectId | string;
}
