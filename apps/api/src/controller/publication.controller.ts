import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { Publication } from '../model/publication.schema';
import { PublicationService } from '../service/publication.service';
import { response } from 'express';

/**
 * Contrôleur pour gérer les opérations liées aux publications.
 */
@Controller('/api/publication')
export class PublicationController {

    /**
     * Constructeur pour PublicationController.
     * @param publicationService - Service pour la logique métier liée aux publications.
     */
    constructor(private readonly publicationService: PublicationService) {}
    
    /**
     * Récupère toutes les publications.
     * @param response Objet de réponse HTTP.
     * @returns La liste des publications avec un statut HTTP 200 (OK).
     */
    @Get('')
    async getPublications(@Res() response): Promise<Publication[]> {
        const publications = await this.publicationService.getAll();
        return response.status(HttpStatus.OK).json(publications);
    }

    /**
     * Récupère une publication par son identifiant.
     * @param response Objet de réponse HTTP.
     * @param id - Identifiant de la publication à récupérer.
     * @returns Les données de la publication si trouvée avec un statut HTTP 200 (OK), ou une erreur HTTP 400 (Bad Request) si l'id est manquant, ou 404 (Not Found) si la publication n'existe pas.
     * 
     */
    @Get('/:id')
    async getPublicationById(@Res() response, @Param('id') id: string): Promise<Publication | undefined> {
        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'identifiant est requis' });

        const pub = await this.publicationService.getById(id);
        if(!pub) return response.status(HttpStatus.NOT_FOUND).json({ message: 'Publication non trouvée' });

        return response.status(HttpStatus.OK).json(pub);
    }

    /**
     * Crée une nouvelle publication.
     * @param response Objet de réponse HTTP.
     * @param pub - Les données de la publication à créer.
     * @returns Les données de la nouvelle publication créée avec un statut HTTP 201 (Created), ou une erreur HTTP 400 (Bad Request) si la validation échoue, ou une erreur HTTP 500 (INTERNAL_SERVER_ERROR) en cas de création impossible.
     */
    @Post('')
    async createPublication(@Res() response, @Body() pub: Publication): Promise<Publication> {

        const toleranceMs = 10 * 1000;
        // Validation des champs requis
        const missing = [
            !pub && 'La publication est requise',
            !pub?.message && 'Le message est requis',
            !pub?.datePublication && 'La date est requise',
            pub?.datePublication && new Date(pub.datePublication).getTime() + toleranceMs < new Date().getTime() && "La date de publication doit être supérieure ou égale à aujourd'hui",
            !pub?.user_id && 'L\'utilisateur est requis',
            !pub?.prediction_id && 'La prédiction est requise',
        ].filter(Boolean)[0];
        if (missing) return response.status(HttpStatus.BAD_REQUEST).json({ message: missing });
        try {
            const created = await this.publicationService.createPublication(pub);
            return response.status(HttpStatus.CREATED).json(created);
        } catch (error) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    /**
     * Crée ou met à jour une publication par son identifiant.
     * @param response - Objet de réponse HTTP.
     * @param id - Identifiant de la publication à créer ou mettre à jour.
     * @param pub - Les données de la publication à créer ou mettre à jour.
     * @returns Les données de la publication créée ou mise à jour avec un statut HTTP 200 (OK), ou une erreur HTTP 400 (Bad Request) si la validation échoue, ou une erreur HTTP 500 (INTERNAL_SERVER_ERROR) en cas de création ou mise à jour impossible.
     */
    @Put('/:id')
    async createOrUpdatePublicationById(@Res() response, @Param('id') id: string, @Body() pub: Publication ): Promise<Publication> {
        const toleranceMs = 10 * 1000;
        // Validation des champs requis
        const missing = [
            !pub && 'La publication est requise',
            !id && 'L\'identifiant est requis',
            !pub?.message && 'Le message est requis',
            !pub?.datePublication && 'La date est requise',
            pub?.datePublication && new Date(pub.datePublication).getTime() + toleranceMs < new Date().getTime() && "La date de publication doit être supérieure ou égale à aujourd'hui",
            !pub?.user_id && 'L\'utilisateur est requis',
            !pub?.prediction_id && 'La prédiction est requise',
        ].filter(Boolean)[0];

        if (missing) return response.status(HttpStatus.BAD_REQUEST).json({ message: missing });

        try {
            const updated = await this.publicationService.createOrUpdateById(id, pub);
            return response.status(HttpStatus.OK).json(updated);
        } catch (e) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message });
        }
    }

    /**
     * Supprime une publication par son identifiant.
     * @param response - Objet de réponse HTTP.
     * @param id - Identifiant de la publication à supprimer.
     * @returns Les données de la publication supprimée avec un statut HTTP 200 (OK), ou une erreur HTTP 400 (Bad Request) si l'id est manquant, ou une erreur HTTP 500 (INTERNAL_SERVER_ERROR) en cas de suppression impossible.
     */
    @Delete('/:id')
    async deletePublicationById(@Res() response, @Param('id') id: string): Promise<Publication> {
        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: "L'identifiant est requis" });
        try {
            const deleted = await this.publicationService.deleteById(id);
            return response.status(HttpStatus.OK).json(deleted);
        } catch (e) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: e.message });
        }
    }
}       