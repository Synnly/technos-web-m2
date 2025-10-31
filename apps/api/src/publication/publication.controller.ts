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
	ValidationPipe,
} from "@nestjs/common";
import { PublicationDto } from "./dto/publication.dto";
import { PublicationService } from "../publication/publication.service";
import { AuthGuard } from "../guards/auth.guard";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { UpdatePublicationDto } from "./dto/update-publication.dto";
import { ParseObjectIdPipe } from "../validators/parse-objectid.pipe";

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
	async getPublications(): Promise<PublicationDto[]> {
		const publications = await this.publicationService.getAll();
		return publications.map((p) => new PublicationDto(p));
	}

	/**
	 * Récupère une publication par son identifiant.
	 * @param id Identifiant de la publication à récupérer.
	 * @returns La publication correspondante
	 * @throws {BadRequestException} si l'identifiant est manquant.
	 * @throws {NotFoundException} si la publication n'est pas trouvée.
	 */
	@Get("/:id")
	async getPublicationById(@Param("id", ParseObjectIdPipe) id: string): Promise<PublicationDto | undefined> {
		const pub = await this.publicationService.getById(id);
		if (!pub) throw new NotFoundException({ message: "Publication non trouvée" });
		return new PublicationDto(pub);
	}

	/**
	 * Crée une nouvelle publication.
	 * @param pub Données de la publication à créer.
	 * @return L'identifiant de la publication créée.
	 * @throws {BadRequestException} si les données de la publication sont invalides ou manquantes.
	 * @throws {InternalServerErrorException} si la création de la publication échoue.
	 */
	@Post("")
	@HttpCode(201)
	async createPublication(
		@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
		pub: CreatePublicationDto,
	) {
		try {
			const publication = await this.publicationService.createPublication(pub);
			return publication._id;
		} catch (error) {
			throw new InternalServerErrorException({ message: error.message });
		}
	}

	/**
	 * Met à jour une publication si elle existe, sinon la crée.
	 * @param id Identifiant de la publication à créer ou mettre à jour
	 * @param pub Publication à créer ou mettre à jour
	 * @throws {BadRequestException} si les données de la publication sont invalides ou manquantes.
	 * @throws {InternalServerErrorException} si la création ou la mise à jour de la publication échoue.
	 */
	@Put("/:id")
	async createOrUpdatePublicationById(
		@Param("id", ParseObjectIdPipe) id: string,
		@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
		pub: UpdatePublicationDto,
	) {
		try {
			await this.publicationService.createOrUpdateById(id, pub);
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message });
		}
	}

	/**
	 * Supprime une publication par son identifiant.
	 * @param id Identifiant de la publication à supprimer.
	 * @throws {BadRequestException} si l'identifiant est manquant.
	 * @throws {InternalServerErrorException} si la suppression de la publication échoue.
	 */
	@Delete("/:id")
	async deletePublicationById(@Param("id", ParseObjectIdPipe) id: string) {
		try {
			await this.publicationService.deleteById(id);
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
		@Param("id", ParseObjectIdPipe) id: string,
		@Param("userId", ParseObjectIdPipe) userId: string,
	): Promise<PublicationDto> {
		try {
			const updated = await this.publicationService.toggleLikePublication(id, userId);
			return new PublicationDto(updated);
		} catch (e) {
			throw new InternalServerErrorException({ message: e.message });
		}
	}
}
