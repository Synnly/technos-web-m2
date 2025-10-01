import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
	Prediction,
	PredictionDocument,
	PredictionStatus,
} from "./prediction.schema";
import { User, UserDocument } from "../user/user.schema";
import { Vote, VoteDocument } from "../vote/vote.schema";

@Injectable()
/**
 * Service responsable de la gestion des opérations liées aux prédictions.
 *
 * Fournit des méthodes pour récupérer, créer, mettre à jour et supprimer des prédictions
 * en utilisant le modèle Mongoose injecté.
 */
export class PredictionService {
	/**
	 * Crée une instance de PredictionService.
	 * @param predictionModel Modèle Mongoose injecté pour interagir avec la collection des prédictions.
	 * @param userModel Modèle Mongoose injecté pour interagir avec la collection des utilisateurs.
	 * @param voteModel Modèle Mongoose injecté pour interagir avec la collection des votes.
	 */
	constructor(
		@InjectModel(Prediction.name)
		private predictionModel: Model<PredictionDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
	) {}

	/**
	 * Normalise un objet prédiction en s'assurant que les références d'utilisateur sont des chaînes.
	 * @param pred L'objet prédiction à normaliser.
	 * @returns L'objet normalisé.
	 */
	private normalizePred(pred: any) {
		const obj =
			typeof pred.toObject === "function" ? pred.toObject() : { ...pred };
		if (obj.user_id && typeof obj.user_id === "object" && obj.user_id._id)
			obj.user_id = String(obj.user_id._id);
		if (obj.user && typeof obj.user === "object" && obj.user._id)
			obj.user_id = String(obj.user._id);
		return obj;
	}

	/**
	 * Récupère toutes les prédictions disponibles.
	 *
	 * @returns Une promesse qui résout un tableau de prédictions.
	 */
	async getAll(): Promise<Prediction[]> {
		// Peupler le champ user_id avec uniquement le username
		const preds = await this.predictionModel
			.find()
			.populate("user_id", "username")
			.exec();
		return (preds as any[]).map((p) => this.normalizePred(p));
	}

	/**
	 * Récupère une prédiction par son identifiant.
	 *
	 * @param id Identifiant MongoDB de la prédiction à récupérer.
	 * @returns Une promesse qui résout la prédiction si elle est trouvée, ou `undefined` sinon.
	 */
	async getById(id: string): Promise<Prediction | undefined> {
		const pred =
			(await this.predictionModel
				.findById(id)
				.populate("user_id", "username")
				.exec()) ?? undefined;
		if (!pred) return undefined;
		return this.normalizePred(pred) as Prediction;
	}

	/**
	 * Crée une nouvelle prédiction dans la base de données.
	 * Le schéma impose que `title` soit présent ; cette méthode se contente de créer
	 * l'enregistrement via le constructeur du modèle et d'appeler `save()`.
	 *
	 * @param pred Objet prédiction à créer.
	 * @returns La promesse qui résout la prédiction créée.
	 */
	async createPrediction(pred: Prediction): Promise<Prediction> {
		const newPred = new this.predictionModel(pred);
		const created = await newPred.save();

		// Si la prédiction a une référence user_id, ajouter cet identifiant de prédiction dans le tableau des
		// prédictions de l'utilisateur
		if (created && (created as any).user_id) {
			await this.userModel
				.findByIdAndUpdate((created as any).user_id, {
					$push: { predictions: created._id },
				})
				.exec();
		}

		return this.normalizePred(created) as Prediction;
	}

	/**
	 * Met à jour une prédiction existante si elle est trouvée, sinon crée une nouvelle prédiction
	 * (optionnellement en conservant l'`id` fourni).
	 *
	 * Les champs non fournis dans `pred` sont laissés tels quels sur le document existant.
	 *
	 * @param id - Identifiant de la prédiction à mettre à jour (ou id souhaité pour la création).
	 * @param pred - Données à appliquer à la prédiction.
	 * @returns La prédiction mise à jour ou nouvellement créée.
	 */
	async createOrUpdateById(
		id: string,
		pred: Prediction,
	): Promise<Prediction> {
		const existing = await this.predictionModel.findById(id).exec();

		if (existing) {
			existing.title = pred.title ?? existing.title;
			existing.description = pred.description ?? existing.description;
			existing.status = pred.status ?? existing.status;
			existing.dateFin = pred.dateFin ?? existing.dateFin;
			existing.options = pred.options ?? existing.options;

			return await existing.save();
		} else {
			// créer une nouvelle prédiction avec l'identifiant fourni si donné
			const toCreate = {
				...pred,
				options: (pred as any).options ?? {},
			} as any;
			if (id) toCreate._id = id;
			const newPred = new this.predictionModel(toCreate);
			const created = await newPred.save();

			if (created && (created as any).user_id) {
				try {
					await this.userModel
						.findByIdAndUpdate((created as any).user_id, {
							$push: { predictions: created._id },
						})
						.exec();
				} catch (e) {}
			}

			return this.normalizePred(created) as Prediction;
		}
	}

	/**
	 * Supprime une prédiction par son identifiant.
	 *
	 * @param id - Identifiant de la prédiction à supprimer.
	 * @returns La prédiction supprimée si elle existait.
	 * @throws Error si la prédiction n'est pas trouvée.
	 */
	async deleteById(id: string): Promise<Prediction> {
		const deleted = await this.predictionModel.findByIdAndDelete(id).exec();
		if (!deleted) {
			throw new Error("Prédiction introuvable");
		}

		// Supprime la référence de la liste des prédictions de l'utilisateur si elle est présente
		try {
			if ((deleted as any).user_id) {
				await this.userModel
					.findByIdAndUpdate((deleted as any).user_id, {
						$pull: { predictions: deleted._id },
					})
					.exec();
			}
		} catch (_) {}

		return this.normalizePred(deleted) as Prediction;
	}

	/**
	 * Permet de valider une prédiction en spécifiant l'option gagnante.
	 * Cette méthode met à jour le statut de la prédiction, enregistre les résultats,
	 * et distribue les récompenses aux utilisateurs ayant voté pour l'option gagnante
	 * en calculant un ratio basé sur les points totaux et les points sur l'option gagnante.
	 * @param predictionId id de la prédiction à valider
	 * @param winningOption option gagnante
	 * @return Un objet contenant les détails de la validation, y compris le ratio et les récompenses distribuées.
	 * @throws Error si la prédiction n'est pas trouvée, si l'option gagnante est invalide,
	 * si aucun point n'a été misé sur l'option gagnante, ou en cas d'erreur lors de la mise à jour des utilisateurs.
	 */
	async validatePrediction(
		predictionId: string,
		winningOption: string,
	): Promise<{
		predictionId: string;
		winningOption: string;
		ratio: number;
		rewards: { user_id: string; gain: number }[];
	}> {
		// Récupérer la prédiction
		const prediction = await this.predictionModel
			.findById(predictionId)
			.exec();
		if (!prediction) throw new Error("Prédiction introuvable");

		// Vérifier que l'option gagnante est valide
		if (!(winningOption in prediction.options))
			throw new Error("Option gagnante invalide");

		// Récupérer tous les votes liés
		const votes = await this.voteModel
			.find({ prediction_id: predictionId })
			.exec();

		// Somme totale et somme sur l’option gagnante
		const totalPoints = Object.values(prediction.options).reduce(
			(a, b) => a + b,
			0,
		);
		const winningPoints = prediction.options[winningOption];

		// Si pas de points sur l’option gagnante, on ne peut pas récompenser
		if (winningPoints === 0)
			throw new Error("Aucun point sur l’option gagnante");

		// Calcul du ratio
		const ratio = totalPoints / winningPoints;

		// Récompenses des utilisateurs
		const rewards: { user_id: string; gain: number }[] = [];

		for (const vote of votes) {
			if (vote.option === winningOption) {
				// Calcul du gain arrondi à l'entier inférieur pour éviter d'introduire des points
				// inexsitants par rapport à l'arrondi supérieur
				const gain = Math.floor(vote.amount * ratio);

				// Crédite le user en base
				await this.userModel.findByIdAndUpdate(
					vote.user_id,
					{ $inc: { points: gain } },
					{ new: true },
				);

				rewards.push({ user_id: vote.user_id.toString(), gain });
			}
		}

		// Mettre à jour la prédiction comme validée
		prediction.status = PredictionStatus.Valid;
		prediction.results = winningOption;
		await prediction.save();

		return {
			predictionId,
			winningOption,
			ratio,
			rewards,
		};
	}

	/**
	 * Retourne les prédictions expirées, c'est-à-dire celles dont la date de fin est passée,
	 * les résultats ne sont pas définis et le statut est "Valid".
	 * @returns Les prédictions expirées
	 */
	async getExpiredPredictions() {
		const now = new Date();
		return this.predictionModel
			.find({
				dateFin: { $lte: now },
				results: "",
				status: PredictionStatus.Valid,
			})
			.exec();
	}

	/**
	 * Retourne les prédictions en attente, c'est-à-dire celles dont le statut est "waiting"
	 * et les résultats ne sont pas encore définis.
	 * @returns les prédictions en attente
	 */
	async getWaitingPredictions() {
		return this.predictionModel
			.find({
				status: PredictionStatus.Waiting,
				results: "",
			})
			.exec();
	}

	/**
	 * Récupère les prédictions validées (status "Valid") qui ne sont pas encore expirées.
	 * @returns la liste des prédictions
	 */
	async getValidPredictions(): Promise<Prediction[]> {
		const now = new Date();
		return this.predictionModel
			.find({
				status: PredictionStatus.Valid,
				dateFin: { $gt: now }, // uniquement les non-expirées
			})
			.exec();
	}
}
