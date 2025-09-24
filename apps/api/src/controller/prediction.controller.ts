import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, Req } from "@nestjs/common";
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
    async createPrediction(@Req() req: any, @Res() response, @Body() pred: Prediction) {
        // Validation simple
        const missing = [
            !pred && 'La prédiction est requise',
            !pred?.title && 'Le titre est requis',
            !pred?.dateFin && 'La date de fin est requise',
            !pred?.options || Object.keys(pred.options).length < 2 && 'Au moins deux options sont requises',
            pred?.status === undefined || pred?.status.toString() === '' ? 'Le statut est requis' : !Object.values(PredictionStatus).includes(pred.status) && 'Le statut est invalide',
            (!req.user?._id && !pred?.user_id) && 'L\'utilisateur authentifié est requis'
        ].filter(Boolean)[0];
    
        if (missing) return response.status(HttpStatus.BAD_REQUEST).json({ message: missing });
    
        // Préparer payload
        const { _id, ...payload } = pred as any;
        payload.options = payload.options ?? {};
        if (req.user?._id) payload.user_id = req.user._id;
    
        try {
            const created = await this.predictionService.createPrediction(payload as Prediction);
            return response.status(HttpStatus.CREATED).json(created);
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }


    /** Met à jour ou crée une prédiction par id */
    @Put('/:id')
    async updatePredictionById(@Req() req: any, @Res() response, @Param('id') id: string, @Body() pred: Prediction) {

        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: "L'identifiant est requis" });

        // Validation simple (identique à create)
        const missing = [
            !pred && 'La prédiction est requise',
            !pred?.title && 'Le titre est requis',
            !pred?.dateFin && 'La date de fin est requise',
            (!pred?.options || Object.keys(pred.options).length < 2) && 'Au moins deux options sont requises',
            pred?.status === undefined || pred?.status.toString() === '' ? 'Le statut est requis' : !Object.values(PredictionStatus).includes(pred.status) && 'Le statut est invalide',
            (!req.user?._id && !pred?.user_id) && "L'utilisateur authentifié est requis",
        ].filter(Boolean)[0];

        if (missing) return response.status(HttpStatus.BAD_REQUEST).json({ message: missing });

        try {
            // Préparer payload
            const { _id, ...payload } = pred as any;
            payload.options = payload.options ?? {};
            if (req.user?._id) payload.user_id = req.user._id;

            // update or create
            const updated = await this.predictionService.createOrUpdateById(id, payload as Prediction,);

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
