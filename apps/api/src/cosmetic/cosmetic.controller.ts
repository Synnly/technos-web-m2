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
} from "@nestjs/common";
import { CosmeticService } from "./cosmetic.service";
import { Cosmetic } from "./cosmetic.schema";
import { Role } from "src/user/user.schema";

/**
 * Contrôleur pour gérer les cosmétiques.
 */
@Controller("/api/cosmetic")
export class CosmeticController {
	constructor(private readonly cosmeticService: CosmeticService) {}

	/**
	 * Récupère tous les cosmétiques.
	 */
	@Get("")
	async getCosmetics(): Promise<Cosmetic[]> {
		return this.cosmeticService.findAll();
	}

	/**
	 * Récupère un cosmétique par son identifiant.
	 * @param id L'identifiant du cosmétique à récupérer
	 * @throws BadRequestException si l'identifiant n'est pas fourni
	 * @throws NotFoundException si aucun cosmétique avec l'identifiant fourni n'est trouvé
	 * @returns le cosmétique
	 */
	@Get("/:id")
	async getCosmeticById(@Param("id") id: string): Promise<Cosmetic> {
		if (!id) throw new BadRequestException("L'identifiant est requis");
		const cosmetic = this.cosmeticService.findById(id);
		if (!cosmetic) throw new NotFoundException("Prédiction non trouvée");

		return cosmetic;
	}

	/**
	 * Crée un nouveau cosmétique.
	 * @param cosmetic le cosmétique à créer
	 * @param user l'utilisateur effectuant la requête (doit être admin)
	 * @param username le nom d'utilisateur de la personne effectuant la requête venant du token
	 * @throws BadRequestException si l'utilisateur n'est pas admin ou si des champs requis sont manquants
	 * @returns le cosmétique créé
	 */
	@Post("")
	@HttpCode(201)
	async createCosmetic(
		@Body() cosmetic,
		@Req() user,
		@Param("username") username: string,
	): Promise<Cosmetic> {
		if (!user || user.username !== username || user.role !== Role.ADMIN) {
			throw new BadRequestException(
				"Seul l'administrateur peut créer un cosmétique",
			);
		}

		const missing = [
			!cosmetic && "Le cosmétique est requis",
			!cosmetic.name && "Le nom du cosmétique est requis",
			!cosmetic.cost && "Le coût du cosmétique est requis",
			!cosmetic.type && "Le type du cosmétique est requis",
		].filter(Boolean);
		if (missing) throw new BadRequestException(missing);

		return this.cosmeticService.create(cosmetic);
	}

	/**
	 * Met à jour un cosmétique existant ou en créer un.
	 * @param id l'identifiant du cosmétique à mettre à jour
	 * @param cosmetic les nouvelles données du cosmétique
	 * @param user l'utilisateur effectuant la requête (doit être admin)
	 * @param username le nom d'utilisateur de la personne effectuant la requête venant du token
	 * @throws BadRequestException si l'utilisateur n'est pas admin ou si des champs requis sont manquants
     * @throws NotFoundException si le cosmétique à mettre à jour n'existe pas
	 * @returns le cosmétique mis à jour
	 */
	@Put("/:id")
	@HttpCode(200)
	async updateCosmetic(
		@Param("id") id: string,
		@Body() cosmetic,
		@Req() user,
		@Param("username") username: string,
	): Promise<Cosmetic> {
		if (!user || user.username !== username || user.role !== Role.ADMIN) {
			throw new BadRequestException(
				"Seul l'administrateur peut modifier un cosmétique",
			);
		}

		const missing = [
			!cosmetic && "Le cosmétique est requis",
			!cosmetic.name && "Le nom du cosmétique est requis",
			!cosmetic.cost && "Le coût du cosmétique est requis",
			!cosmetic.type && "Le type du cosmétique est requis",
		].filter(Boolean);
		if (missing) throw new BadRequestException(missing);

        if(id !== undefined){
            const existing = await this.cosmeticService.findById(id);
            if(!existing) {
                throw new NotFoundException("Cosmétique non trouvé");
            }
        }

		return this.cosmeticService.updateById(id, cosmetic);
	}

	/**
	 * Supprime un cosmétique par son identifiant.
	 * @param id l'identifiant du cosmétique à supprimer
	 * @param user le utilisateur effectuant la requête (doit être admin)
	 * @param username le nom d'utilisateur de la personne effectuant la requête venant du token
	 * @throws BadRequestException si l'utilisateur n'est pas admin ou si une erreur survient lors de la suppression
     * @throws NotFoundException si le cosmétique n'est pas trouvé
	 * @returns le cosmétique supprimé
	 */
	@Delete("/:id")
	async deleteCosmetic(
		@Param("id") id: string,
		@Req() user,
		@Param("username") username: string,
	): Promise<Cosmetic> {
		if (!user || user.username !== username || user.role !== Role.ADMIN) {
			throw new BadRequestException(
				"Seul l'administrateur peut supprimer un cosmétique",
			);
		}

        const cosmetic = await this.cosmeticService.findById(id);
        if (!cosmetic) {
            throw new NotFoundException("Cosmétique non trouvé");
        }

		try {
			const deleted = await this.cosmeticService.deleteById(id);
			return deleted;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}