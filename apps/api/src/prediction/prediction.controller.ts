import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Req,
	BadRequestException,
	NotFoundException,
	UseGuards,
	Query,
	ParseIntPipe,
	ValidationPipe,
} from "@nestjs/common";
import { PredictionService } from "./prediction.service";
import { CreatePredictionDto } from "./dto/createprediction.dto";
import { UpdatePredictionDto } from "./dto/updateprediction.dto";
import { PredictionDto } from "./dto/prediction.dto";
import { AuthGuard } from "../guards/auth.guard";
import { AdminGuard } from "../guards/admin.guard";
import { ParseObjectIdPipe } from "../validators/parse-objectid.pipe";

/**
 * Contrôleur pour gérer les prédictions.
 */
@UseGuards(AuthGuard)
@Controller("/api/prediction")
export class PredictionController {
	constructor(private readonly predictionService: PredictionService) {}

	/**
	 * Récupère toutes les prédictions.
	 * @returns Liste des prédictions.
	 */
	@Get("")
	async getPredictions(): Promise<PredictionDto[]> {
		const preds = await this.predictionService.getAll();
		return preds.map((p) => new PredictionDto(p));
	}

	/**
	 * Retourne la liste des prédictions expirées (dateFin < aujourd'hui)
	 * @returns une réponse HTTP (OK) avec la liste des prédictions expirées
	 */
	@Get("/expired")
	async getExpiredPredictions(
		@Query("page", ParseIntPipe) page: number,
		@Query("limit", ParseIntPipe) limit: number,
	): Promise<PredictionDto[]> {
		const preds = await this.predictionService.getExpiredPredictions(page, limit);
		return preds.map((p) => new PredictionDto(p));
	}

	/**
	 * Retourne la liste des prédictions en attente (status "waiting")
	 * @returns une réponse HTTP (OK) avec la liste des prédictions en attente
	 */
	@Get("/waiting")
	async getWaitingPredictions(
		@Query("page", ParseIntPipe) page: number,
		@Query("limit", ParseIntPipe) limit: number,
	): Promise<PredictionDto[]> {
		const preds = await this.predictionService.getWaitingPredictions(page, limit);
		return preds.map((p) => new PredictionDto(p));
	}

	/**
	 * Retourne la liste des prédictions validées (status "valid")
	 * @returns une réponse HTTP (OK) avec la liste des prédictions validées
	 */
	@Get("/valid")
	async getValidPredictions(
		@Query("page", ParseIntPipe) page: number,
		@Query("limit", ParseIntPipe) limit: number,
	): Promise<PredictionDto[]> {
		const preds = await this.predictionService.getValidPredictions(page, limit);
		return preds.map((p) => new PredictionDto(p));
	}

	/**
	 * Retourne la liste des prédictions validées (status "Closed")
	 * @returns une réponse HTTP (OK) avec la liste des prédictions validées
	 */
	@Get("/closed")
	async getClosedPredictions(
		@Query("page", ParseIntPipe) page: number,
		@Query("limit", ParseIntPipe) limit: number,
	): Promise<PredictionDto[]> {
		const preds = await this.predictionService.getClosedPredictions(page, limit);
		return preds.map((p) => new PredictionDto(p));
	}

	/**
	 * Récupère une prédiction par son id.
	 * @param id Identifiant de la prédiction.
	 * @returns La prédiction correspondante.
	 * @throws {BadRequestException} Si l'id est manquant.
	 * @throws {NotFoundException} Si la prédiction n'existe pas.
	 */
	@Get("/:id")
	async getPredictionById(@Param("id", ParseObjectIdPipe) id: string): Promise<PredictionDto> {
		const pred = await this.predictionService.getById(id);
		if (!pred) throw new NotFoundException("Prédiction non trouvée");
		return new PredictionDto(pred);
	}

	/**
	 * Crée une nouvelle prédiction.
	 * @param req Objet de requête HTTP.
	 * @param pred La prédiction à créer. Le titre, la date de fin, au moins 2 options, le statut et
	 * l'utilisateur sont requis.
	 * @throws {BadRequestException} Si la validation échoue, ou si une erreur se produit lors de la création.
	 */
	@Post("")
	@HttpCode(201)
	async createPrediction(
		@Req() req: any,
		@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
		pred: CreatePredictionDto,
	) {
		try {
			await this.predictionService.createPrediction(pred, req.user.username);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
	@Put("/:id")
	async updatePredictionById(
		@Req() req: any,
		@Param("id", ParseObjectIdPipe) id: string,
		@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
		pred: UpdatePredictionDto,
	) {
		try {
			// Creer ou mettre à jour
			await this.predictionService.createOrUpdateById(id, pred);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	/**
	 * Supprime une prédiction par son id.
	 * @param id Identifiant de la prédiction à supprimer.
	 * @throws {BadRequestException} Si l'id est manquant ou si une erreur se produit lors de la suppression.
	 */
	@Delete("/:id")
	async deletePrediction(@Param("id", ParseObjectIdPipe) id: string) {
		try {
			await this.predictionService.deleteById(id);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	/**
	 * Valide une prédiction en spécifiant l'option gagnante.
	 * @param id Identifiant de la prédiction à valider.
	 * @param body Corps de la requête contenant l'option gagnante.
	 * @returns La prédiction validée.
	 * @throws {BadRequestException} Si l'id ou l'option gagnante est manquant, ou si une erreur se produit lors de la validation.
	 */
	@Put("/:id/validate")
	@UseGuards(AdminGuard)
	async validatePrediction(
		@Param("id", ParseObjectIdPipe) id: string,
		@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
		body: { winningOption: string },
	): Promise<{
		predictionId: string;
		winningOption: string;
		ratio: number;
		rewards: { user_id: string; gain: number }[];
	}> {
		const { winningOption } = body;
		if (!winningOption) {
			throw new BadRequestException("L’option gagnante est requise");
		}
		try {
			const result = await this.predictionService.validatePrediction(id, winningOption);
			return result;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Get("/:id/timeline")
	async getPredictionTimeline(
		@Param("id", ParseObjectIdPipe) id: string,
		@Query("intervalMinutes", ParseIntPipe) intervalMinutes: number,
		@Query("votesAsPercentage") votesAsPercentage?: any,
		@Query("fromStart") fromStart?: any,
	): Promise<any> {
		if (!intervalMinutes || intervalMinutes <= 0) {
			throw new BadRequestException("L'intervalle en minutes doit être un nombre positif");
		}

		// Normalize optional boolean flags (accepts 'true'|'false' or boolean)
		const votesAsPercentageBool =
			votesAsPercentage === undefined ? false : votesAsPercentage === true || votesAsPercentage === "true";
		const fromStartBool = fromStart === undefined ? false : fromStart === true || fromStart === "true";

		try {
			const timeline = await this.predictionService.getPredictionTimeline(
				id,
				intervalMinutes,
				votesAsPercentageBool,
				fromStartBool,
			);
			return timeline;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@UseGuards(AdminGuard)
	@Get("/:id/ai")
	async triggerAIPronostic(@Param("id", ParseObjectIdPipe) id: string) {
		try {
			await this.predictionService.updatePronosticsByAI(id);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}
