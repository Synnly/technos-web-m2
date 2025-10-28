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
import { Prediction, PredictionStatus } from "./prediction.schema";
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
	 * Récupère une prédiction par son id.
	 * @param id Identifiant de la prédiction.
	 * @returns La prédiction correspondante.
	 * @throws {BadRequestException} Si l'id est manquant.
	 * @throws {NotFoundException} Si la prédiction n'existe pas.
	 */
	@Get("/:id")
	async getPredictionById(@Param("id", ParseObjectIdPipe) id: string): Promise<PredictionDto> {
		if (!id) throw new BadRequestException("L'identifiant est requis");

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
		// Validation simple
		const rawPred: any = pred;
		const missing = [
			!pred && "La prédiction est requise",
			!rawPred?.title && "Le titre est requis",
			!rawPred?.dateFin && "La date de fin est requise",
			rawPred?.dateFin &&
				new Date(rawPred.dateFin) < new Date() &&
				"La date de fin doit être supérieure ou égale à aujourd'hui",
			!rawPred?.options || (Object.keys(rawPred.options).length < 2 && "Au moins deux options sont requises"),
			rawPred?.status === undefined || rawPred?.status.toString() === ""
				? "Le statut est requis"
				: !Object.values(PredictionStatus).includes(rawPred.status) && "Le statut est invalide",
			!req.user?._id && "L'utilisateur authentifié est requis",
			rawPred?.result !== undefined &&
				rawPred?.result !== "" &&
				"On ne peut voter pour une prédiction déjà validée",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException(missing);

		// Préparer payload
		const { _id, ...payload } = pred as any;
		payload.options = payload.options ?? {};
		if (req.user?._id) payload.user_id = req.user._id;

		try {
			const created = await this.predictionService.createPrediction(payload as Prediction);
			return new PredictionDto(created);
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
		if (!id) throw new BadRequestException("L'identifiant est requis");

		// Validation simple (identique à create)
		const rawPred2: any = pred;
		const missing = [
			!pred && "La prédiction est requise",
			!rawPred2?.title && "Le titre est requis",
			!rawPred2?.dateFin && "La date de fin est requise",
			rawPred2?.dateFin &&
				new Date(rawPred2.dateFin) < new Date() &&
				"La date de fin doit être supérieure ou égale à aujourd'hui",
			(!rawPred2?.options || Object.keys(rawPred2.options).length < 2) && "Au moins deux options sont requises",
			rawPred2?.status === undefined || rawPred2?.status.toString() === ""
				? "Le statut est requis"
				: !Object.values(PredictionStatus).includes(rawPred2.status) && "Le statut est invalide",
			!req.user?._id && !rawPred2?.user_id && "L'utilisateur authentifié est requis",
			rawPred2?.result !== undefined &&
				rawPred2?.result !== "" &&
				"On ne peut voter pour une prédiction déjà validée",
		].filter(Boolean)[0];

		if (missing) throw new BadRequestException(missing);

		try {
			// Préparer payload
			const { _id, ...payload } = pred as any;
			if (req.user?._id) payload.user_id = req.user._id;

			// Creer ou mettre à jour
			await this.predictionService.createOrUpdateById(id, payload as Prediction);
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
		if (!id) throw new BadRequestException("L'identifiant est requis");

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
		if (!id) throw new BadRequestException("L'identifiant est requis");
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
}
