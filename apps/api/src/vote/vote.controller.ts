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
} from "@nestjs/common";
import { VoteService } from "../vote/vote.service";

/**
 * Contrôleur pour la gestion des votes sur les prédictions.
 * Fournit les endpoints CRUD pour les votes.
 */
@Controller("/api/vote")
export class VoteController {
	constructor(private readonly voteService: VoteService) {}

	/**
	 * Récupère tous les votes du système.
	 * @param response Objet de réponse HTTP
	 * @returns {Promise<void>} Liste complète des votes avec statut HTTP 200 (OK)
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
	 * @returns {Promise<void>} Le vote correspondant avec statut HTTP 200 (OK) ou 404 (Not Found) si le vote est introuvable
	 */
	@Get("/:id")
	async getVoteById(@Param("id") id: string) {
		const vote = await this.voteService.getById(id);
		if (!vote) throw new NotFoundException("Vote introuvable");
		return vote;
	}

	/**
	 * Crée un nouveau vote sur une prédiction.
	 * L'utilisateur doit être authentifié et le vote doit respecter les contraintes métier.
	 *
	 * @param req Objet de requête HTTP contenant les informations d'authentification
	 * @param response Objet de réponse HTTP
	 * @param vote Données du vote à créer (prediction_id, option, amount, date)
	 * @returns {Promise<void>} Le vote créé avec statut HTTP 201 (Created) ou 400 (Bad Request) si les données sont invalides ou manquantes
	 */
	@Post("")
    @HttpCode(201)
	async createVote(@Req() req: any, @Body() vote) {
		if (!vote) throw new BadRequestException("Les données du vote sont requises");

		const missing = [
			!vote.prediction_id && "L'identifiant de la prédiction est requis",
			!vote.option && "Le choix est requis",
			vote.amount === undefined && "Le montant est requis",
			!vote.date && "La date est requise",
			!req.user?._id && "L'utilisateur authentifié est requis",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException(missing);
		if (vote.amount < 1) throw new BadRequestException("Le montant doit être au moins de 1 point");

		const { _id, ...payload } = vote as any;
		if (req.user?._id) payload.user_id = req.user._id;

		try {
			const created = await this.voteService.createVote(payload);
			return created;
		} catch (error) {
			throw new BadRequestException(
                error.message || "Erreur lors de la création du vote",
            );
		}
	}

	/**
	 * Met à jour un vote existant ou le crée s'il n'existe pas.
	 *
	 * @param req Objet de requête HTTP contenant les informations d'authentification
	 * @param response Objet de réponse HTTP
	 * @param id Identifiant du vote à mettre à jour
	 * @param vote Nouvelles données du vote (user_id, prediction_id, option, amount)
	 * @returns {Promise<void>} Le vote mis à jour avec statut HTTP 200 (OK) ou 400 (Bad Request) si les données sont invalides ou manquantes
	 */
	@Put("/:id")
	async updateVote(
		@Req() req: any,
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
			!req.user?._id && "L'utilisateur authentifié est requis",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException(missing);
		if (vote.amount < 1) throw new BadRequestException("Le montant doit être au moins de 1 point");

		try {
			// Préparer payload
			const { _id, ...payload } = vote as any;
			if (req.user?._id) payload.user_id = req.user._id;

			// Créer ou mettre à jour le vote
			const updated = await this.voteService.createOrUpdateVote(
				id,
				payload,
			);
			return updated;
		} catch (error) {
			throw new BadRequestException(
                error.message || "Erreur lors de la mise à jour du vote",
            );
		}
	}

	/**
	 * Supprime définitivement un vote du système.
	 * Cette action est irréversible.
	 *
	 * @param response Objet de réponse HTTP
	 * @param id Identifiant du vote à supprimer
	 * @returns {Promise<void>} Le vote supprimé avec statut HTTP 200 (OK) ou 404 (Not Found) si le vote est introuvable
	 */
	@Delete("/:id")
	async deleteVote(@Param("id") id: string) {
		const deleted = await this.voteService.deleteVote(id);
		if (!deleted) throw new NotFoundException("Vote introuvable");
		return deleted;
	}
}
