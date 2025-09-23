import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from "@nestjs/common";
import { Prediction, PredictionStatus } from "../model/prediction.schema";
import { PredictionService } from "../service/prediction.service";

/**
 * Contrôleur pour gérer les prédictions.
 */
@Controller('/api/prediction')
export class PredictionController {
    constructor(private readonly predictionService: PredictionService) {}

    /** Récupère toutes les prédictions */
    @Get('')
    async getPredictions(@Res() response) {
        const preds = await this.predictionService.getAll();
        return response.status(HttpStatus.OK).json(preds);
    }

    /** Récupère une prédiction par son id */
    @Get('/:id')
    async getPredictionById(@Res() response, @Param('id') id: string) {
        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'identifiant est requis' });

        const pred = await this.predictionService.getById(id);
        if (!pred) return response.status(HttpStatus.NOT_FOUND).json({ message: 'Prédiction non trouvée' });

        return response.status(HttpStatus.OK).json(pred);
    }

    /** Crée une nouvelle prédiction */
    @Post('')
    async createPrediction(@Res() response, @Body() pred: Prediction) {
        if (!pred) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'La prédiction est requise' });
    if (!pred.title) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le titre est requis' });
    if (!pred.dateFin) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'La date de fin est requise' });
        // Ensure we don't use a client-provided _id; MongoDB will assign one
        const { _id, ...payload } = pred as any;
        try {
            const created = await this.predictionService.createPrediction(payload as Prediction);
            return response.status(HttpStatus.CREATED).json(created);
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }

    /** Met à jour ou crée une prédiction par id */
    @Put('/:id')
    async updatePredictionById(@Res() response, @Param('id') id: string, @Body() pred: Prediction) {
        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'identifiant est requis' });
    if (!pred) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'La prédiction est requise' });
    if (!pred.dateFin) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'La date de fin est requise' });

        try {
            // Ignore any _id present in the body to avoid conflicts with the path id
            const { _id, ...payload } = pred as any;
            const updated = await this.predictionService.createOrUpdateById(id, payload as Prediction);
            return response.status(HttpStatus.OK).json(updated);
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }

    /** Supprime une prédiction par id */
    @Delete('/:id')
    async deletePrediction(@Res() response, @Param('id') id: string) {
        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'identifiant est requis' });

        try {
            const deleted = await this.predictionService.deleteById(id);
            return response.status(HttpStatus.OK).json(deleted);
        } catch (error) {
            return response.status(error.status || HttpStatus.NOT_FOUND).json({ message: error.message });
        }
    }
}
