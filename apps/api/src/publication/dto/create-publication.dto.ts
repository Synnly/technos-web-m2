import { IsNotEmpty, IsString, IsDateString, IsOptional, IsArray } from "class-validator";
import { Types } from "mongoose";

export class CreatePublicationDto {
    @IsString()
    @IsNotEmpty()
    message: string;

    @IsDateString()
    @IsNotEmpty()
    datePublication: string;

    @IsNotEmpty()
    prediction_id: Types.ObjectId | string;

    @IsOptional()
    @IsNotEmpty()
    parentPublication_id?: Types.ObjectId | string;

    @IsNotEmpty()
    user_id: Types.ObjectId | string;

    @IsOptional()
    @IsArray()
    @IsNotEmpty({ each: true })
    likes?: (Types.ObjectId | string)[];
}
