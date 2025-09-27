import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res } from "@nestjs/common";
import { VoteService } from "../service/vote.service";

@Controller('/api/vote')
export class VoteController {
    constructor(private readonly voteService: VoteService) {}

    /**
     * Récupère tous les votes.
     * @param response Objet de réponse HTTP.
     * @returns Liste des votes.
     */
    @Get('')
    async getVotes(@Res() response) {
        const votes = await this.voteService.getAll();
        return response.status(HttpStatus.OK).json(votes);
    }

    /**
     * Récupère un vote par son id.
     * @param response Objet de réponse HTTP.
     * @param id Identifiant du vote.
     * @returns Le vote correspondant à l'id, ou une erreur HTTP 404 (Not Found) si le vote n'existe pas.
     */
    @Get('/:id')
    async getVoteById(@Res() response, @Param('id') id: string) {
        const vote = await this.voteService.getById(id);
        if (!vote) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: 'Vote introuvable' });
        }
        return response.status(HttpStatus.OK).json(vote);
    }

    /**
     * Crée un nouveau vote.
     * @param req Objet de requête HTTP.
     * @param response Objet de réponse HTTP.
     * @param vote Les données du vote à créer.
     * @returns Le vote créé, ou une erreur HTTP 400 (Bad Request) si la validation échoue.
     */
    @Post('')
    async createVote(@Req() req: any, @Res() response, @Body() vote) {
        if (!vote) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Les données du vote sont requises' });
        
        const missing = [
            !vote.prediction_id && "L'identifiant de la prédiction est requis",
            !vote.option && 'Le choix est requis',
            vote.amount === undefined && 'Le montant est requis',
            !vote.date && 'La date est requise',
            !req.user?._id && 'L\'utilisateur authentifié est requis',
        ].filter(Boolean)[0];

        if (missing) return response.status(HttpStatus.BAD_REQUEST).json({ message: missing });
        if(vote.amount < 1) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le montant doit être au moins de 1 point' });

        const {_id, ...payload } = vote as any;
        if (req.user?._id) payload.user_id = req.user._id;

        try {
            const created = await this.voteService.createVote(payload);
            return response.status(HttpStatus.CREATED).json(created);
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: error.message || 'Erreur lors de la création du vote' });
        }
    }

    /**
     * Met à jour un vote existant.
     * @param req Objet de requête HTTP.
     * @param response Objet de réponse HTTP.
     * @param id Identifiant du vote à mettre à jour.
     * @param vote Les données du vote à mettre à jour.
     * @returns Le vote mis à jour, ou une erreur HTTP 400 (Bad Request) si la validation échoue.
     */
    @Put('/:id')
    async updateVote(@Req() req: any, @Res() response, @Param('id') id: string, @Body() vote) {
        if (!vote) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Les données du vote sont requises' });

        const missing = [
            !id && "L'identifiant du vote est requis",
            !vote && 'Les données du vote sont requises',
            !vote.user_id && "L'identifiant de l'utilisateur est requis",
            !vote.prediction_id && "L'identifiant de la prédiction est requis",
            !vote.option && 'Le choix est requis',
            vote.amount === undefined && 'Le montant est requis',
            !req.user?._id && 'L\'utilisateur authentifié est requis',
        ].filter(Boolean)[0];

        if (missing) return response.status(HttpStatus.BAD_REQUEST).json({ message: missing });
        if(vote.amount < 1) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le montant doit être au moins de 1 point' });

        try {
            // Préparer payload
        const {_id, ...payload } = vote as any;
        if (req.user?._id) payload.user_id = req.user._id;

            // Créer ou mettre à jour le vote
            const updated = await this.voteService.createOrUpdateVote(id, payload);
            return response.status(HttpStatus.OK).json(updated);
        } catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: error.message || 'Erreur lors de la mise à jour du vote' });
        }
    }

    /**
     * Supprime un vote par son id.
     * @param response Objet de réponse HTTP.
     * @param id Identifiant du vote à supprimer.
     * @returns Le vote supprimé, ou une erreur HTTP 404 (Not Found) si le vote n'existe pas.
     */
    @Delete('/:id')
    async deleteVote(@Res() response, @Param('id') id: string) {
        const deleted = await this.voteService.deleteVote(id);
        if (!deleted) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: 'Vote introuvable' });
        }
        return response.status(HttpStatus.OK).json(deleted);
    }
}