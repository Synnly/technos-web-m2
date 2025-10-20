import { IsDateString, IsNotEmpty, IsString, IsObject, MinLength, IsEnum, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { PredictionStatus } from '../prediction.schema';

/**
 * DTO pour la création d'une prédiction.
 */
export class CreatePredictionDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsDateString()
    dateFin: string;

    @IsNotEmpty()
    @IsObject()
    options: Record<string, number>;

    @IsOptional()
    @IsEnum(PredictionStatus)
    status?: PredictionStatus;

    constructor(partial: Partial<CreatePredictionDto>) {
        Object.assign(this, partial);
    }
}
