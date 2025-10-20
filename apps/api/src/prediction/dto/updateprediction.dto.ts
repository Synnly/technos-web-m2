import { IsOptional, IsString, IsDateString, IsObject, MinLength, IsEnum } from 'class-validator';
import { PredictionStatus } from '../prediction.schema';

/**
 * DTO pour la mise à jour d'une prédiction.
 */
export class UpdatePredictionDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    dateFin?: string;

    @IsOptional()
    @IsObject()
    options?: Record<string, number>;

    @IsOptional()
    @IsEnum(PredictionStatus)
    status?: PredictionStatus;

    @IsOptional()
    @IsString()
    result?: string;

    constructor(partial: Partial<UpdatePredictionDto>) {
        Object.assign(this, partial);
    }
}
