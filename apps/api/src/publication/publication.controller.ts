import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	InternalServerErrorException,
	NotFoundException,
	Param,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { Publication } from "./publication.schema";
import { PublicationService } from "../publication/publication.service";
import { AuthGuard } from "../guards/auth.guard";

/**
 * Contrôleur pour gérer les opérations liées aux publications.
 */
@UseGuards(AuthGuard)
@Controller("/api/publication")
export class PublicationController {
	/**
	 * Constructeur pour PublicationController.
	 * @param publicationService Service pour la logique métier liée aux publications.
	 */
	constructor(private readonly publicationService: PublicationService) {}

	/**
	 * Récupère toutes les publications.
	 * @returns Un tableau de publications
	 */
	@Get("")
	async getPublications(): Promise<Publication[]> {
		const publications = await this.publicationService.getAll();
		return publications;
	}

	/**
	 * Récupère une publication par son identifiant.
	 * @param id Identifiant de la publication à récupérer.
	 * @returns La publication correspondante
	 * @throws {BadRequestException} si l'identifiant est manquant.
	 * @throws {NotFoundException} si la publication n'est pas trouvée.
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
	 * @param pub Données de la publication à créer.
	 * @returns La publication créée
	 * @throws {BadRequestException} si les données de la publication sont invalides ou manquantes.
	 * @throws {InternalServerErrorException} si la création de la publication échoue.
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
	 * Met à jour une publication si elle existe, sinon la crée.
	 * @param id Identifiant de la publication à créer ou mettre à jour
	 * @param pub Publication à créer ou mettre à jour
	 * @returns La publication créée ou mise à jour
	 * @throws {BadRequestException} si les données de la publication sont invalides ou manquantes.
	 * @throws {InternalServerErrorException} si la création ou la mise à jour de la publication échoue.
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
	 * @param id Identifiant de la publication à supprimer.
	 * @returns La publication supprimée.
	 * @throws {BadRequestException} si l'identifiant est manquant.
	 * @throws {InternalServerErrorException} si la suppression de la publication échoue.
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
	 * @param id Identifiant de la publication à liker ou unliker.
	 * @param userId Identifiant de l'utilisateur qui like ou unlike la publication.
	 * @returns La publication mise à jour.
	 * @throws {BadRequestException} si l'identifiant de la publication ou de l'utilisateur est manquant.
	 * @throws {InternalServerErrorException} si la mise à jour de la publication échoue.
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
