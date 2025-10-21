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

    @IsOptional()
    @IsHexColor()
    hexColor?: string;

    @IsOptional()
    @IsBoolean()
    owned?: boolean;
}
