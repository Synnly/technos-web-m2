import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, Req, Query } from "@nestjs/common";
import { Prediction, PredictionStatus } from "../model/prediction.schema";
import { PredictionService } from "../service/prediction.service";

/**
 * Contrôleur pour gérer les prédictions.
 */
@Controller('/api/prediction')
export class PredictionController {
    constructor(private readonly predictionService: PredictionService) {}

    /**
     * Récupère toutes les prédictions.
     * @param response Objet de réponse HTTP.
     * @returns Liste des prédictions.
     */
    @Get('')
    async getPredictions(@Res() response) {
        const preds = await this.predictionService.getAll();
        return response.status(HttpStatus.OK).json(preds);
    }


    /**
     * 
     * @returns La liste des prédictions expirées
     */
    @Get('/expired')
    async getExpiredPredictions() {
      return this.predictionService.getExpiredPredictions();
    }

    /**
     * Retourne la liste des prédictions en attente (status "waiting")
     * @returns predictions en attente
     */
    @Get('/waiting')
    async getWaitingPredictions() {
      return this.predictionService.getWaitingPredictions();
    }

    /**
     * Retourne la liste des prédictions validées (status "valid")
     * @returns predictions validées
     */
    @Get('/valid')
    async getValidPredictions() {
        return this.predictionService.getValidPredictions();
    }


    /**
     * Récupère une prédiction par son id.
     * @param response Objet de réponse HTTP.
     * @param id Identifiant de la prédiction.
     * @returns La prédiction correspondante ou une erreur HTTP 400 (Bad Request) si l'id est manquant, ou 404 (Not 
     * Found) si la prédiction n'existe pas.
     */
    @Get('/:id')
    async getPredictionById(@Res() response, @Param('id') id: string) {
        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'identifiant est requis' });

        const pred = await this.predictionService.getById(id);
        if (!pred) return response.status(HttpStatus.NOT_FOUND).json({ message: 'Prédiction non trouvée' });

        return response.status(HttpStatus.OK).json(pred);
    }

    /**
     * Récupère une prédiction par son id.
     * @param req Objet de requête HTTP.
     * @param response Objet de réponse HTTP.
     * @param pred La prédiction à créer ou mettre à jour. Le titre, la date de fin, au moins 2 options, le statut et 
     * l'utilisateur sont requis.
     * @returns La prédiction créée ou mise à jour, ou une erreur HTTP 400 (Bad Request) si la validation échoue.
     */
    @Post('')
    async createPrediction(@Req() req: any, @Res() response, @Body() pred: Prediction) {
        // Validation simple
        const missing = [
            !pred && 'La prédiction est requise',
            !pred?.title && 'Le titre est requis',
            !pred?.dateFin && 'La date de fin est requise',
            pred?.dateFin && new Date(pred.dateFin) < new Date() && "La date de fin doit être supérieure ou égale à aujourd'hui",
            !pred?.options || Object.keys(pred.options).length < 2 && 'Au moins deux options sont requises',
            pred?.status === undefined || pred?.status.toString() === '' ? 'Le statut est requis' : !Object.values(PredictionStatus).includes(pred.status) && 'Le statut est invalide',
            (!req.user?._id && !pred?.user_id) && 'L\'utilisateur authentifié est requis',
            pred?.results !== '' && 'On ne peut voter pour une prédiction déjà validée',
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


    /**
     * Met à jour une prédiction existante par son id.
     * Si la prédiction n'existe pas, elle est créée avec l'id fourni.
     * @param req Objet de requête HTTP.
     * @param response Objet de réponse HTTP.
     * @param id Identifiant de la prédiction.
     * @param pred La prédiction à mettre à jour. Le titre, la date de fin, au moins 2 options, le statut et 
     * l'utilisateur sont requis.
     * @returns La prédiction mise à jour ou créée, ou une erreur HTTP 400 (Bad Request) si la validation échoue.
     */
    @Put('/:id')
    async updatePredictionById(@Req() req: any, @Res() response, @Param('id') id: string, @Body() pred: Prediction) {

        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: "L'identifiant est requis" });

        // Validation simple (identique à create)
        const missing = [
            !pred && 'La prédiction est requise',
            !pred?.title && 'Le titre est requis',
            !pred?.dateFin && 'La date de fin est requise',
            pred?.dateFin && new Date(pred.dateFin) < new Date() && "La date de fin doit être supérieure ou égale à aujourd'hui",
            (!pred?.options || Object.keys(pred.options).length < 2) && 'Au moins deux options sont requises',
            pred?.status === undefined || pred?.status.toString() === '' ? 'Le statut est requis' : !Object.values(PredictionStatus).includes(pred.status) && 'Le statut est invalide',
            (!req.user?._id && !pred?.user_id) && "L'utilisateur authentifié est requis",
            pred?.results !== '' && 'On ne peut voter pour une prédiction déjà validée',
        ].filter(Boolean)[0];

        if (missing) return response.status(HttpStatus.BAD_REQUEST).json({ message: missing });

        try {
            // Préparer payload
            const { _id, ...payload } = pred as any;
            if (req.user?._id) payload.user_id = req.user._id;

            // Creer ou mettre à jour
            const updated = await this.predictionService.createOrUpdateById(id, payload as Prediction);

            return response.status(HttpStatus.OK).json(updated);
            
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }

    /**
     * Supprime une prédiction par son id.
     * @param response Objet de réponse HTTP.
     * @param id Identifiant de la prédiction.
     * @returns La prédiction supprimée ou une erreur HTTP 404 (Not Found) si la prédiction n'existe pas.
     */
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

    /**
     * Valide une prédiction en spécifiant l’option gagnante.
     * @param id l'id de la prédiction
     * @param body body contenant l’option gagnante
     * @param res Objet de réponse HTTP.
     * @returns La prédiction validée avec le statut mis à jour et les récompenses distribuées, ou une erreur HTTP 400 (Bad Request) si la validation échoue.
     */
    @Put('/:id/validate')
    async validatePrediction(@Param('id') id: string, @Body() body: { winningOption: string }, @Res() res) {
        const { winningOption } = body;
        if (!winningOption) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'L’option gagnante est requise' });
        }
        try {
            const result = await this.predictionService.validatePrediction(id, winningOption);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
        }
    }
}

