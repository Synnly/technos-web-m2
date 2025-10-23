import {
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Body,
	BadRequestException,
	NotFoundException,
	Req,
	HttpCode,
	UseGuards,
} from "@nestjs/common";
import { CosmeticService } from "./cosmetic.service";
import { CosmeticDto } from "./dto/cosmetic.dto";
import { Role, User } from "../user/user.schema";
import { AuthGuard } from "../guards/auth.guard";
import { AdminGuard } from "../guards/admin.guard";
import { CreateCosmeticDto } from "./dto/create-cosmetic.dto";
import { UpdateCosmeticDto } from "./dto/update-cosmetic.dto";

/**
 * Contrôleur pour gérer les cosmétiques.
 */
@UseGuards(AuthGuard)
@Controller("/api/cosmetic")
export class CosmeticController {
	constructor(private readonly cosmeticService: CosmeticService) {}

	/**
	 * Récupère tous les cosmétiques.
	 */
	@Get("")
	async getCosmetics(): Promise<CosmeticDto[]> {
		const list = await this.cosmeticService.findAll();
		return list.map((c) => new CosmeticDto(c));
	}

	/**
	 * Récupère un cosmétique par son identifiant.
	 * @param id L'identifiant du cosmétique à récupérer
	 * @throws BadRequestException si l'identifiant n'est pas fourni
	 * @throws NotFoundException si aucun cosmétique avec l'identifiant fourni n'est trouvé
	 * @returns le cosmétique
	 */
	@Get("/:id")
	async getCosmeticById(@Param("id") id: string): Promise<CosmeticDto> {
		if (!id) throw new BadRequestException("L'identifiant est requis");
		const cosmetic = await this.cosmeticService.findById(id);
		if (!cosmetic) throw new NotFoundException("Prédiction non trouvée");

		return new CosmeticDto(cosmetic);
	}

	/**
	 * Crée un nouveau cosmétique.
	 * @param cosmetic le cosmétique à créer
	 * @param req la requête HTTP contenant l'utilisateur authentifié
	 * @param username le nom d'utilisateur de la personne effectuant la requête venant du token
	 * @throws BadRequestException si l'utilisateur n'est pas admin ou si des champs requis sont manquants
	 */
	@Post("/:username")
	@UseGuards(AdminGuard)
	@HttpCode(201)
	async createCosmetic(
		@Body() cosmetic: CreateCosmeticDto,
		@Req() req,
		@Param("username") username,
	) {

		const user = req && (req as any).user ? (req as any).user : req;
		if (!user || user.role !== Role.ADMIN || user.username !== username) {
			throw new BadRequestException(
				"Seul l'administrateur peut créer un cosmétique",
			);
		}

		const missing = [
			!cosmetic && "Le cosmétique est requis",
			!cosmetic?.name && "Le nom du cosmétique est requis",
			!cosmetic?.cost && "Le coût du cosmétique est requis",
			!cosmetic?.type && "Le type du cosmétique est requis",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException(missing);

		await this.cosmeticService.create(cosmetic as any);
	}

	/**
	 * Met à jour un cosmétique existant ou en créer un.
	 * @param id l'identifiant du cosmétique à mettre à jour
	 * @param cosmetic les nouvelles données du cosmétique
	 * @param req la requête HTTP contenant l'utilisateur authentifié
	 * @param username le nom d'utilisateur de la personne effectuant la requête venant du token
	 * @throws BadRequestException si l'utilisateur n'est pas admin ou si des champs requis sont manquants
	 * @throws NotFoundException si le cosmétique à mettre à jour n'existe pas
	 */
	@Put("/:id")
	@UseGuards(AdminGuard)
	@HttpCode(200)
	async updateCosmetic(
		@Param("id") id: string,
		@Body() cosmetic: UpdateCosmeticDto,
		@Req() req,
		@Param("username") username: string,
	) {
		const user = req && (req as any).user ? (req as any).user : req;
		if (!user || user.role !== Role.ADMIN || user.username !== username) {
			throw new BadRequestException(
				"Seul l'administrateur peut créer un cosmétique",
			);
		}

		const missing = [
			!cosmetic && "Le cosmétique est requis",
			!cosmetic?.name && "Le nom du cosmétique est requis",
			!cosmetic?.cost && "Le coût du cosmétique est requis",
			!cosmetic?.type && "Le type du cosmétique est requis",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException(missing);

		if (id !== undefined) {
			const existing = await this.cosmeticService.findById(id);
			if (!existing) {
				throw new NotFoundException("Cosmétique non trouvé");
			}
		}

		await this.cosmeticService.updateById(id, cosmetic );
	}

	/**
	 * Supprime un cosmétique par son identifiant.
	 * @param id l'identifiant du cosmétique à supprimer
	 * @param req la requête HTTP contenant l'utilisateur authentifié
	 * @param username le nom d'utilisateur de la personne effectuant la requête venant du token
	 * @throws BadRequestException si l'utilisateur n'est pas admin ou si une erreur survient lors de la suppression
	 * @throws NotFoundException si le cosmétique n'est pas trouvé
	 */
	@Delete("/:id/:username")
	@UseGuards(AdminGuard)
	async deleteCosmetic(
		@Param("id") id: string,
		@Req() req,
		@Param("username") username: string,
	) {
		const user = req && (req as any).user ? (req as any).user : req;
		if (!user || user.role !== Role.ADMIN || user.username !== username) {
			throw new BadRequestException(
				"Seul l'administrateur peut créer un cosmétique",
			);
		}

		const cosmetic = await this.cosmeticService.findById(id);
		if (!cosmetic) {
			throw new NotFoundException("Cosmétique non trouvé");
		}

		try {
			await this.cosmeticService.deleteById(id);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
