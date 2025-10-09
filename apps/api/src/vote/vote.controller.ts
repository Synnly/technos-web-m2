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
	 * @returns Le vote créé avec statut
	 * @throws {BadRequestException} si les données du vote sont invalides ou manquantes
	 */
	@Post("")
    @HttpCode(201)
	async createVote(@Body() vote) {
		if (!vote) throw new BadRequestException("Les données du vote sont requises");

		const missing = [
			!vote.prediction_id && "L'identifiant de la prédiction est requis",
			!vote.option && "Le choix est requis",
			vote.amount === undefined && "Le montant est requis",
			!vote.date && "La date est requise",
			!vote.user_id && "L'utilisateur est requis",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException(missing);
		if (vote.amount < 1) throw new BadRequestException("Le montant doit être au moins de 1 point");

		// const { _id, ...payload } = vote as any;
		// if (req.user?._id) payload.user_id = req.user._id;

		try {
			const created = await this.voteService.createVote(vote);
			return created;
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
	 * @returns Le vote mis à jour
	 * @throws {BadRequestException} si les données du vote sont invalides ou manquantes
	 * @throws {NotFoundException} si le vote n'existe pas
	 */
	@Put("/:id")
	async updateVote(
		@Param("id") id: string,
		@Body() vote,
	) {
		if (!vote) throw new BadRequestException("Les données du vote sont requises");

		const missing = [
			!id && "L'identifiant du vote est requis",
			!vote && "Les données du vote sont requises",
			!vote.user_id && "L'identifiant de l'utilisateur est requis",
			!vote.prediction_id && "L'identifiant de la prédiction est requis",
			!vote.option && "Le choix est requis",
			vote.amount === undefined && "Le montant est requis",
			!vote.user_id && "L'utilisateur est requis",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException(missing);
		if (vote.amount < 1) throw new BadRequestException("Le montant doit être au moins de 1 point");

		try {
			// Créer ou mettre à jour le vote
			const updated = await this.voteService.createOrUpdateVote(
				id,
				vote,
			);
			return updated;
		} catch (error) {
			throw new BadRequestException(
                error.message || "Erreur lors de la mise à jour du vote",
            );
		}
	}

	/**
	 * Supprime un vote existant.
	 * @param id Identifiant unique du vote à supprimer
	 * @returns Le vote supprimé
	 * @throws {NotFoundException} si le vote n'existe pas
	 */
	@Delete("/:id")
	async deleteVote(@Param("id") id: string) {
		const deleted = await this.voteService.deleteVote(id);
		if (!deleted) throw new NotFoundException("Vote introuvable");
		return deleted;
	}
}
