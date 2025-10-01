import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	NotFoundException,
	Param,
	Post,
	Put,
} from "@nestjs/common";
import { Publication } from "./publication.schema";
import { PublicationService } from "../publication/publication.service";
import { response } from "express";

/**
 * Contrôleur pour gérer les opérations liées aux publications.
 */
@Controller("/api/publication")
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
	@Get("")
	async getPublications(): Promise<Publication[]> {
		const publications = await this.publicationService.getAll();
		return publications;
	}

	/**
	 * Récupère une publication par son identifiant.
	 * @param response Objet de réponse HTTP.
	 * @param id - Identifiant de la publication à récupérer.
	 * @returns Les données de la publication si trouvée avec un statut HTTP 200 (OK), ou une erreur HTTP 400 (Bad Request) si l'id est manquant, ou 404 (Not Found) si la publication n'existe pas.
	 *
	 */
	@Get("/:id")
	async getPublicationById(
		@Param("id") id: string,
	): Promise<Publication | undefined> {
		if (!id)
			throw new BadRequestException({
				message: "L'identifiant est requis",
			});

		const pub = await this.publicationService.getById(id);
		if (!pub)
			throw new NotFoundException({ message: "Publication non trouvée" });

		return pub;
	}

	/**
	 * Crée une nouvelle publication.
	 * @param response Objet de réponse HTTP.
	 * @param pub - Les données de la publication à créer.
	 * @returns Les données de la nouvelle publication créée avec un statut HTTP 201 (Created), ou une erreur HTTP 400 (Bad Request) si la validation échoue, ou une erreur HTTP 500 (INTERNAL_SERVER_ERROR) en cas de création impossible.
	 */
	@Post("")
	@HttpCode(201)
	async createPublication(@Body() pub: Publication): Promise<Publication> {
		const toleranceMs = 10 * 1000;
		// Validation des champs requis
		const missing = [
			!pub && "La publication est requise",
			!pub?.message && "Le message est requis",
			!pub?.datePublication && "La date est requise",
			pub?.datePublication &&
				new Date(pub.datePublication).getTime() + toleranceMs <
					new Date().getTime() &&
				"La date de publication doit être supérieure ou égale à aujourd'hui",
			!pub?.user_id && "L'utilisateur est requis",
			!pub?.prediction_id && "La prédiction est requise",
		].filter(Boolean)[0];
		if (missing) throw new BadRequestException({ message: missing });
		try {
			const created =
				await this.publicationService.createPublication(pub);
			return created;
		} catch (error) {
			throw new InternalServerErrorException({ message: error.message });
		}
	}

	/**
	 * Crée ou met à jour une publication par son identifiant.
	 * @param response - Objet de réponse HTTP.
	 * @param id - Identifiant de la publication à créer ou mettre à jour.
	 * @param pub - Les données de la publication à créer ou mettre à jour.
	 * @returns Les données de la publication créée ou mise à jour avec un statut HTTP 200 (OK), ou une erreur HTTP 400 (Bad Request) si la validation échoue, ou une erreur HTTP 500 (INTERNAL_SERVER_ERROR) en cas de création ou mise à jour impossible.
	 */
	@Put("/:id")
	async createOrUpdatePublicationById(
		@Param("id") id: string,
		@Body() pub: Publication,
	): Promise<Publication> {
		const toleranceMs = 10 * 1000;
		// Validation des champs requis
		const missing = [
			!pub && "La publication est requise",
			!id && "L'identifiant est requis",
			!pub?.message && "Le message est requis",
			!pub?.datePublication && "La date est requise",
			pub?.datePublication &&
				new Date(pub.datePublication).getTime() + toleranceMs <
					new Date().getTime() &&
				"La date de publication doit être supérieure ou égale à aujourd'hui",
			!pub?.user_id && "L'utilisateur est requis",
			!pub?.prediction_id && "La prédiction est requise",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException({ message: missing });

		try {
			const updated = await this.publicationService.createOrUpdateById(
				id,
				pub,
			);
			return updated;
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message });
		}
	}

	/**
	 * Supprime une publication par son identifiant.
	 * @param response - Objet de réponse HTTP.
	 * @param id - Identifiant de la publication à supprimer.
	 * @returns Les données de la publication supprimée avec un statut HTTP 200 (OK), ou une erreur HTTP 400 (Bad Request) si l'id est manquant, ou une erreur HTTP 500 (INTERNAL_SERVER_ERROR) en cas de suppression impossible.
	 */
	@Delete("/:id")
	async deletePublicationById(@Param("id") id: string): Promise<Publication> {
		if (!id)
			throw new BadRequestException({
				message: "L'identifiant est requis",
			});
		try {
			const deleted = await this.publicationService.deleteById(id);
			return deleted;
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message });
		}
	}

	/**
	 * Permet à un utilisateur de liker ou unliker une publication.
	 * @param response Objet de réponse HTTP.
	 * @param id Identifiant de la publication à liker ou unliker.
	 * @param userId Identifiant de l'utilisateur qui like ou unlike la publication.
	 * @returns Les données de la publication mise à jour avec un statut HTTP 200 (OK), ou une erreur HTTP 400
	 * (Bad Request) si l'id ou userId est manquant, ou une erreur HTTP 500 (INTERNAL_SERVER_ERROR) en cas de mise à jour
	 *  impossible.
	 */
	@Put("/:id/toggle-like/:userId")
	async toggleLikePublication(
		@Param("id") id: string,
		@Param("userId") userId: string,
	): Promise<Publication> {
		if (!id)
			throw new BadRequestException({
				message: "L'identifiant de la publication est requis",
			});
		if (!userId)
			throw new BadRequestException({
				message: "L'identifiant de l'utilisateur est requis",
			});
		try {
			const updated = await this.publicationService.toggleLikePublication(
				id,
				userId,
			);
			return updated;
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message });
		}
	}
}
