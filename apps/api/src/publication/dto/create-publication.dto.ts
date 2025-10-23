import { IsNotEmpty, IsString, IsOptional, IsArray, IsDate } from "class-validator";

export class CreatePublicationDto {
    @IsString()
    @IsNotEmpty()
    message: string;

    @IsDate()
    @IsNotEmpty()
    datePublication: Date;

    @IsNotEmpty()
    prediction_id: string;

    @IsOptional()
    @IsNotEmpty()
    parentPublication_id?: string;

    @IsNotEmpty()
    user_id: string;

    @IsOptional()
    @IsArray()
    @IsNotEmpty({ each: true })
    likes?: string[];

    constructor(partial: Partial<CreatePublicationDto>) {
        Object.assign(this, partial);
    }
}
