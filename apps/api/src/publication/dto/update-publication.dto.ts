import { IsOptional, IsString, IsArray, IsNotEmpty, IsDate } from "class-validator";

export class UpdatePublicationDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    message?: string;

    @IsOptional()
    @IsDate()
    datePublication?: Date;

    @IsOptional()
    prediction_id?: string;

    @IsOptional()
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
