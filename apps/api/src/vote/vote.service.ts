import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
	Prediction,
	PredictionDocument,
} from "../prediction/prediction.schema";
import { User, UserDocument } from "../user/user.schema";
import { Vote, VoteDocument } from "../vote/vote.schema";

/**
 * Service pour la gestion des votes sur les prédictions.
 * Gère les opérations CRUD et les règles métier des votes.
 */
@Injectable()
export class VoteService {
	/**
	 * Crée une instance de VoteService.
	 * @param voteModel Le modèle Mongoose pour interagir avec la collection des votes
	 * @param userModel Le modèle Mongoose pour interagir avec la collection des utilisateurs
	 * @param predictionModel Le modèle Mongoose pour interagir avec la collection des prédictions
	 */
	constructor(
		@InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Prediction.name)
		private predictionModel: Model<PredictionDocument>,
	) {}

	/**
	 * Normalise un objet vote en s'assurant que les références d'utilisateur et de prédiction sont des chaînes.
	 * @param vote L'objet vote à normaliser
	 * @returns {Vote} L'objet vote normalisé
	 */
	private normalizeVote(vote: any) {
		const obj =
			typeof vote.toObject === "function" ? vote.toObject() : { ...vote };
		if (obj.user_id && typeof obj.user_id === "object" && obj.user_id._id)
			obj.user_id = String(obj.user_id._id);
		if (obj.user && typeof obj.user === "object" && obj.user._id)
			obj.user_id = String(obj.user._id);

		if (
			obj.prediction_id &&
			typeof obj.prediction_id === "object" &&
			obj.prediction_id._id
		)
			obj.prediction_id = String(obj.prediction_id._id);
		if (
			obj.prediction &&
			typeof obj.prediction === "object" &&
			obj.prediction._id
		)
			obj.prediction_id = String(obj.prediction._id);
		return obj;
	}

	/**
	 * Récupère tous les votes du système.
	 * @returns {Promise<Vote[]>} Tableau contenant tous les votes
	 */
	async getAll(): Promise<Vote[]> {
		const votes = await this.voteModel.find().exec();
		return votes.map((vote) => this.normalizeVote(vote));
	}

	/**
	 * Récupère un vote par son identifiant.
	 * @param id Identifiant MongoDB du vote à récupérer
	 * @returns {Promise<Vote | undefined>} Le vote trouvé ou undefined si inexistant
	 */
	async getById(id: string): Promise<Vote | undefined> {
		const vote = (await this.voteModel.findById(id).exec()) ?? undefined;
		if (!vote) return undefined;
		return this.normalizeVote(vote) as Vote;
	}

	/**
	 * Crée un nouveau vote et met à jour les données utilisateur et prédiction.
	 * Retire les points de l'utilisateur et met à jour le montant total de l'option.
	 * @param vote Les données du vote à créer
	 * @returns {Promise<Vote>} Le vote créé
	 * @throws {Error} Si l'utilisateur n'existe pas
	 * @throws {Error} Si l'utilisateur n'a pas assez de points
	 * @throws {Error} Si la prédiction n'existe pas
	 * @throws {Error} Si une erreur survient lors de la mise à jour
	 */
	async createVote(vote: Vote): Promise<Vote> {
		// Vérifier que l'utilisateur et la prédiction existent
		const user = await this.userModel.findById(vote.user_id).exec();
		if (!user) throw new Error("Utilisateur non trouvé");

		if (user.points < vote.amount) throw new Error("Points insuffisants");

		const prediction = await this.predictionModel
			.findById(vote.prediction_id)
			.exec();
		if (!prediction) throw new Error("Prédiction non trouvée");

		// Créer et sauvegarder le vote
		const newVote = new this.voteModel(vote);
		const created = await newVote.save();

		// Ajouter le vote à la liste des votes de l'utilisateur
		if (created && (created as any).user_id) {
			try {
				await this.userModel
					.findByIdAndUpdate((created as any).user_id, {
						$push: { votes: created._id },
					})
					.exec();
				await this.userModel
					.findByIdAndUpdate((created as any).user_id, {
						$inc: { points: -vote.amount },
					})
					.exec();

				// Correction de la mise à jour des options de prédiction
				const updateOptions = {};
				updateOptions[`options.${vote.option}`] = vote.amount;
				await this.predictionModel
					.findByIdAndUpdate((created as any).prediction_id, {
						$inc: updateOptions,
					})
					.exec();
			} catch (e) {
				throw new Error(`Erreur update user: ${e.message}`);
			}
		}

		return this.normalizeVote(newVote) as Vote;
	}

	/**
	 * Crée ou met à jour un vote existant.
	 * Gère automatiquement les points utilisateur et les totaux de prédiction.
	 * @param id Identifiant MongoDB du vote à créer ou mettre à jour
	 * @param vote Les données du vote à créer ou mettre à jour
	 * @returns {Promise<Vote | undefined>} Le vote créé ou mis à jour
	 * @throws {Error} Si l'utilisateur n'existe pas
	 * @throws {Error} Si l'utilisateur n'a pas assez de points
	 * @throws {Error} Si la prédiction n'existe pas
	 * @throws {Error} Si une erreur survient lors de la création ou mise à jour
	 */
	async createOrUpdateVote(
		id: string,
		vote: Vote,
	): Promise<Vote | undefined> {
		const existingVote = await this.voteModel.findById(id).exec();

		// Verifier que l'utilisateur et la prédiction existent
		const user = await this.userModel.findById(vote.user_id).exec();
		if (!user) throw new Error("Utilisateur non trouvé");

		const prediction = await this.predictionModel
			.findById(vote.prediction_id)
			.exec();
		if (!prediction) throw new Error("Prédiction non trouvée");

		let newVote;

		if (existingVote) {
			// Mettre à jour le vote existant
			// Verifier que l'utilisateur a assez de points si le montant augmente
			if (
				vote.amount > existingVote.amount &&
				user.points < vote.amount - existingVote.amount
			) {
				throw new Error("Points insuffisants");
			}

			existingVote.amount = vote.amount ?? existingVote.amount;
			existingVote.option = vote.option ?? existingVote.option;
			existingVote.prediction_id =
				vote.prediction_id ?? existingVote.prediction_id;
			existingVote.user_id = vote.user_id ?? existingVote.user_id;

			newVote = await existingVote.save();
		} else {
			// Créer un nouveau vote
			// Verifier que l'utilisateur a assez de points
			if (user.points < vote.amount)
				throw new Error("Points insuffisants");

			const toCreate = vote;
			toCreate._id = id;
			const newPred = new this.voteModel(toCreate);
			newVote = await newPred.save();
		}

		if (newVote && (newVote as any).user_id) {
			try {
				await this.userModel
					.findByIdAndUpdate((newVote as any).user_id, {
						$push: { votes: newVote._id },
					})
					.exec();
				await this.userModel
					.findByIdAndUpdate((newVote as any).user_id, {
						$inc: { points: -vote.amount },
					})
					.exec();

				// Correction de la mise à jour des options de prédiction
				const updateOptions = {};
				updateOptions[`options.${vote.option}`] = vote.amount;
				await this.predictionModel
					.findByIdAndUpdate((newVote as any).prediction_id, {
						$inc: updateOptions,
					})
					.exec();
			} catch (e) {
				throw new Error(
					`Erreur ${existingVote ? "mise à jour" : "création"} du vote: ${e.message}`,
				);
			}
		}

		return this.normalizeVote(newVote) as Vote;
	}

	/**
	 * Supprime un vote et restitue les points à l'utilisateur.
	 * Met à jour automatiquement les totaux de prédiction.
	 * @param id Identifiant MongoDB du vote à supprimer
	 * @returns {Promise<Vote | undefined>} Le vote supprimé ou undefined si inexistant
	 * @throws {Error} Si une erreur survient lors de la suppression
	 */
	async deleteVote(id: string): Promise<Vote | undefined> {
		const deleted = await this.voteModel.findByIdAndDelete(id).exec();
		if (!deleted) return undefined;

		try {
			// Retirer le vote de la liste des votes de l'utilisateur et rembourser les points
			await this.userModel
				.findByIdAndUpdate(deleted.user_id, {
					$pull: { votes: deleted._id },
				})
				.exec();
			await this.userModel
				.findByIdAndUpdate(deleted.user_id, {
					$inc: { points: deleted.amount },
				})
				.exec();

			// Mettre à jour le montant total de l'option votée
			const updateOptions = {};
			updateOptions[`options.${deleted.option}`] = -deleted.amount;
			await this.predictionModel
				.findByIdAndUpdate(deleted.prediction_id, {
					$inc: updateOptions,
				})
				.exec();
		} catch (e) {
			throw new Error("Erreur suppression du vote:");
		}

		return this.normalizeVote(deleted) as Vote;
	}
}
