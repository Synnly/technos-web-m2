import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Prediction, PredictionDocument, PredictionStatus } from "../model/prediction.schema";
import { User, UserDocument } from "../model/user.schema";
import { Vote, VoteDocument } from "../model/vote.schema";


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
	 */
	constructor(
		@InjectModel(Prediction.name) private predictionModel: Model<PredictionDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
	) {}

	
	/**
	 * Normalise un objet prédiction en s'assurant que les références d'utilisateur sont des chaînes.
	 * @param pred L'objet prédiction à normaliser.
	 * @returns L'objet normalisé.
	 */
	private normalizePred(pred: any) {
		const obj = typeof pred.toObject === 'function' ? pred.toObject() : { ...pred };
		if (obj.user_id && typeof obj.user_id === 'object' && obj.user_id._id) obj.user_id = String(obj.user_id._id);
		if (obj.user && typeof obj.user === 'object' && obj.user._id) obj.user_id = String(obj.user._id);
		return obj;
	}
	
	/**
	 * Récupère toutes les prédictions disponibles.
	 *
	 * @returns Une promesse qui résout un tableau de prédictions.
	 */
	async getAll(): Promise<Prediction[]> {
		// Peupler le champ user_id avec uniquement le username
		const preds = await this.predictionModel.find().populate('user_id', 'username').exec();
		return (preds as any[]).map((p) => this.normalizePred(p));
	}

	/**
	 * Récupère une prédiction par son identifiant.
	 *
	 * @param id Identifiant MongoDB de la prédiction à récupérer.
	 * @returns Une promesse qui résout la prédiction si elle est trouvée, ou `undefined` sinon.
	 */
	async getById(id: string): Promise<Prediction | undefined> {
		const pred = await this.predictionModel.findById(id).populate('user_id', 'username').exec() ?? undefined;
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
			try {
				await this.userModel.findByIdAndUpdate((created as any).user_id, { $push: { predictions: created._id } }).exec();
			} catch (e) {
				console.error("Erreur update user:", e);
			}
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
	async createOrUpdateById(id: string, pred: Prediction): Promise<Prediction> {
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
			const toCreate = { ...pred, options: (pred as any).options ?? {} } as any;
			if (id) toCreate._id = id;
			const newPred = new this.predictionModel(toCreate);
			const created = await newPred.save();

			if (created && (created as any).user_id) {
				try {
					await this.userModel.findByIdAndUpdate((created as any).user_id, { $push: { predictions: created._id } }).exec();
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
	 * @throws HttpException avec statut 404 si la prédiction n'existe pas.
	 */
	async deleteById(id: string): Promise<Prediction> {
		const deleted = await this.predictionModel.findByIdAndDelete(id).exec();
		if (!deleted) {
			throw new HttpException('Prediction not found', HttpStatus.NOT_FOUND);
		}

		// Supprime la référence de la liste des prédictions de l'utilisateur si elle est présente
		try {
			if ((deleted as any).user_id) {
				await this.userModel.findByIdAndUpdate((deleted as any).user_id, { $pull: { predictions: deleted._id } }).exec();
			}
		} catch (_){}

		return this.normalizePred(deleted) as Prediction;
	}

	async validatePrediction(predictionId: string, winningOption: string) {
	  // Récupérer la prédiction
	  const prediction = await this.predictionModel.findById(predictionId).exec();
	  if (!prediction) throw new Error('Prédiction introuvable');

	  if (!prediction.options[winningOption]) {
	    throw new Error('Option gagnante invalide');
	  }

	  // Récupérer tous les votes liés
	  const votes = await this.voteModel.find({ prediction_id: predictionId }).exec();

	  // Somme totale et somme sur l’option gagnante
	  const totalPoints = Object.values(prediction.options).reduce((a, b) => a + b, 0);
	  const winningPoints = prediction.options[winningOption];

	  if (winningPoints === 0) throw new Error('Aucun point sur l’option gagnante');

	  const ratio = totalPoints / winningPoints;

	  // Récompenses des utilisateurs
	  const rewards: { user_id: string; gain: number }[] = [];

	  for (const vote of votes) {
	    if (vote.option === winningOption) {
	      const gain = Math.floor(vote.amount * ratio);

	      // Crédite le user en base
	      await this.userModel.findByIdAndUpdate(
	        vote.user_id,
	        { $inc: { points: gain } },
	        { new: true }
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

}
