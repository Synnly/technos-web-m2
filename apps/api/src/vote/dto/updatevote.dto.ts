import { IsOptional, IsNumber, IsString, IsDate } from "class-validator";

export class UpdateVoteDto {
    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    prediction_id?: string;

    @IsOptional()
    @IsString()
    option?: string;

    @IsOptional()
    @IsDate()
    date?: Date;

    @IsOptional()
    user_id?: string;

    constructor(partial: Partial<UpdateVoteDto>) {
        Object.assign(this, partial);
    }
}
