import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from "@nestjs/common";
import { CreateVoteDto } from "./dto/createvote.dto";
import { UpdateVoteDto } from "./dto/updatevote.dto";
import { VoteService } from "../vote/vote.service";
import { AuthGuard } from "../guards/auth.guard";

/**
 * Contrôleur pour la gestion des votes sur les prédictions.
 * Fournit les endpoints CRUD pour les votes.
 */
@UseGuards(AuthGuard)
@Controller("/api/vote")
export class VoteController {
	constructor(private readonly voteService: VoteService) {}

	/**
	 * Récupère tous les votes du système.
	 * @param response Objet de réponse HTTP
	 * @returns La liste complète des votes
	 */
	@Get("")
	async getVotes() {
		const votes = await this.voteService.getAll();
		return votes;
	}

	/**
	 * Récupère un vote spécifique par son identifiant.
	 * @param response Objet de réponse HTTP
	 * @param id Identifiant unique du vote à récupérer
	 * @returns Le vote correspondant
	 * @throws {NotFoundException} si le vote n'existe pas
	 */
	@Get("/:id")
	async getVoteById(@Param("id") id: string) {
		const vote = await this.voteService.getById(id);
		if (!vote) throw new NotFoundException("Vote introuvable");
		return vote;
	}

	/**
	 * Crée un nouveau vote pour une prédiction.
	 * @param vote Données du vote à créer (user_id, prediction_id, option, amount, date)
	 * @throws {BadRequestException} si les données du vote sont invalides ou manquantes
	 */
	@Post("")
	@HttpCode(201)
	async createVote(@Body() vote: CreateVoteDto) {
		if (!vote) throw new BadRequestException("Les données du vote sont requises");
		if (vote.amount < 1) throw new BadRequestException("Le montant doit être au moins de 1 point");
		try {
			// On ignore le champ _id, le service/mongoose le gère
			const { _id, ...payload } = vote as any;
			await this.voteService.createVote(payload);
		} catch (error) {
			throw new BadRequestException(
				error.message || "Erreur lors de la création du vote",
			);
		}
	}

	/**
	 * Met à jour un vote existant.
	 * @param id Identifiant unique du vote à mettre à jour
	 * @param vote Données du vote à mettre à jour (user_id, prediction_id, option, amount, date)
	 * @throws {BadRequestException} si les données du vote sont invalides ou manquantes
	 * @throws {NotFoundException} si le vote n'existe pas
	 */
	@Put("/:id")
	async updateVote(
		@Param("id") id: string,
		@Body() vote: UpdateVoteDto,
	) {
		if (!vote) throw new BadRequestException("Les données du vote sont requises");
		if (vote.amount !== undefined && vote.amount < 1) throw new BadRequestException("Le montant doit être au moins de 1 point");
		try {
			// On ignore le champ _id, le service/mongoose le gère
			const { _id, ...payload } = vote as any;
			await this.voteService.createOrUpdateVote(
				id,
				payload,
			);
		
		} catch (error) {
			throw new BadRequestException(
				error.message || "Erreur lors de la mise à jour du vote",
			);
		}
	}

	/**
	 * Supprime un vote existant.
	 * @param id Identifiant unique du vote à supprimer
	 * @throws {NotFoundException} si le vote n'existe pas
	 */
	@Delete("/:id")
	async deleteVote(@Param("id") id: string) {
		const deleted = await this.voteService.deleteVote(id);
		if (!deleted) throw new NotFoundException("Vote introuvable");	
	}
}
