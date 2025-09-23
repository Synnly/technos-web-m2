import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Prediction, PredictionDocument, PredictionStatus } from "../model/prediction.schema";


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
	 * @param predictionModel - Modèle Mongoose injecté pour interagir avec la collection des prédictions.
	 */
	constructor(@InjectModel(Prediction.name) private predictionModel: Model<PredictionDocument>) {}

	/**
	 * Récupère toutes les prédictions disponibles.
	 *
	 * @returns Une promesse qui résout un tableau de prédictions.
	 */
	async getAll(): Promise<Prediction[]> {
		return await this.predictionModel.find().exec();
	}

	/**
	 * Récupère une prédiction par son identifiant.
	 *
	 * @param id - Identifiant MongoDB de la prédiction à récupérer.
	 * @returns Une promesse qui résout la prédiction si elle est trouvée, ou `undefined` sinon.
	 */
	async getById(id: string): Promise<Prediction | undefined> {
		return await this.predictionModel.findById(id).exec() ?? undefined;
	}

	/**
	 * Crée une nouvelle prédiction dans la base de données.
	 *
	 * Le schéma impose que `title` soit présent ; cette méthode se contente de créer
	 * l'enregistrement via le constructeur du modèle et d'appeler `save()`.
	 *
	 * @param pred - Objet prédiction à créer.
	 * @returns La prédiction créée.
	 */
	async createPrediction(pred: Prediction): Promise<Prediction> {
		// Ensure options is at least an empty object so the schema receives it
		const safePred = { ...pred, options: (pred as any).options ?? {} } as Prediction;
		// Simple create - title is required by schema
		const newPred = new this.predictionModel(safePred);
		return await newPred.save();
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
			// create new with provided id if given
			const toCreate = { ...pred, options: (pred as any).options ?? {} } as any;
			if (id) toCreate._id = id;
			const newPred = new this.predictionModel(toCreate);
			return await newPred.save();
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
		return deleted;
	}
}
