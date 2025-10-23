import { IsOptional, IsString, IsDateString, IsArray, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class UpdatePublicationDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    message?: string;

    @IsOptional()
    @IsDateString()
    datePublication?: string;

    @IsOptional()
    prediction_id?: Types.ObjectId | string;

    @IsOptional()
    parentPublication_id?: Types.ObjectId | string;

    @IsOptional()
    user_id?: Types.ObjectId | string;

    @IsOptional()
    @IsArray()
    @IsNotEmpty({ each: true })
    likes?: (Types.ObjectId | string)[];
}
