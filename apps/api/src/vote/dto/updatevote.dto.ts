import { IsOptional, IsNumber, IsString, IsDateString } from "class-validator";
import { Types } from "mongoose";

export class UpdateVoteDto {
    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    prediction_id?: Types.ObjectId | string;

    @IsOptional()
    @IsString()
    option?: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    user_id?: Types.ObjectId | string;
}
