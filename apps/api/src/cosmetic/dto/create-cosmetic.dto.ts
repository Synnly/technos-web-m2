import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsHexColor } from "class-validator";
import { CosmeticType } from "../cosmetic.schema";

export class CreateCosmeticDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    cost: number;

    @IsEnum(CosmeticType)
    type: CosmeticType;

    @IsString()
    value: string;

    @IsOptional()
    @IsBoolean()
    owned?: boolean;
}
