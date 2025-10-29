import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsHexColor } from "class-validator";
import { CosmeticType } from "../cosmetic.schema";

export class UpdateCosmeticDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsNumber()
    cost?: number;

    @IsOptional()
    @IsEnum(CosmeticType)
    type?: CosmeticType;

    @IsString()
    value: string;


    constructor(partial: Partial<UpdateCosmeticDto>) {
        Object.assign(this, partial);
    }
}
