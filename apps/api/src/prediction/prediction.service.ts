import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import axios from "axios";
import {
	Prediction,
	PredictionDocument,
	PredictionStatus,
} from "./prediction.schema";
import { User, UserDocument } from "../user/user.schema";
import { Vote, VoteDocument } from "../vote/vote.schema";
import OpenAI from "openai";
import { ConfigService } from "@nestjs/config";

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
		private configService: ConfigService,
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

	/**
	 * Effectue une recherche web pour un titre donné en utilisant l'API LangSearch.
	 * @param title Le titre à rechercher
	 * @returns Une liste de 10 résumés de pages web correspondant à la recherche
	 * @throws Error si la clé API LangSearch est absente
	 */
	async queryWebSearch(title: string): Promise<String[]> {
		const LANGSEARCH_API_KEY =
			this.configService.get<string>("LANGSEARCH_API_KEY");
		if (!LANGSEARCH_API_KEY)
			throw new Error("Clé API LangSearch manquante");

		const result = await axios.post(
			"https://api.langsearch.com/v1/web-search",
			{
				query: title,
				freshness: "onemonth",
				summary: true,
				count: 10,
			},
			{
				headers: {
					Authorization: `Bearer ${LANGSEARCH_API_KEY}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (result.data.data.webPages.value === null)
			throw new Error("Aucune recherche ne correspond aux mots clés");

		return result.data.data.webPages.value.map((page: any) =>
			page.summary.replace(/\\n/g, " ").replace(/\s+/g, " ").trim(),
		);
	}

	/**
	 * Réordonne une liste de documents en fonction de leur pertinence par rapport à un titre donné. Utilise l'API LangSearch.
	 * @param title Le titre à utiliser comme requête
	 * @param documents La liste de documents à réordonner
	 * @returns La liste réordonnée des 5 documents les plus pertinents
	 * @throws Error si la clé API LangSearch est absente
	 */
	async rerankDocuments(
		title: string,
		documents: String[],
	): Promise<String[]> {
		const LANGSEARCH_API_KEY =
			this.configService.get<string>("LANGSEARCH_API_KEY");
		if (!LANGSEARCH_API_KEY)
			throw new Error("Clé API LangSearch manquante");

		const result = await axios.post(
			"https://api.langsearch.com/v1/rerank",
			{
				model: "langsearch-reranker-v1",
				query: title,
				documents: documents,
				top_n: 5,
				return_documents: true,
			},
			{
				headers: {
					Authorization: `Bearer ${LANGSEARCH_API_KEY}`,
					"Content-Type": "application/json",
				},
			},
		);

		return result.data.results.map((res: any) => res.document.text);
	}

	/**
	 * Génère une requête à rechercher à partir d'un titre en utilisant l'API OpenAI.
	 * @param title Le titre à utiliser pour générer la requête
	 * @returns La requête générée
	 * @throws Error si la clé API OpenAI est absente, ou si l'IA n'arrive pas à identifier deux mots clés
	 */
	async getQueryFromTitle(title: string): Promise<string> {
		const OPENAI_API_KEY = this.configService.get<string>("OPENAI_API_KEY");
		if (!OPENAI_API_KEY) throw new Error("Clé API OpenAI manquante");

		const client = new OpenAI();
		const response = await client.responses.create({
			model: "gpt-5-nano",
			input: [
				{
					role: "developer",
					content: `Génère entre 2 et 10 mots-clés pertinents pour effectuer une recherche sur internet sur 
					les dernières actualités afin de répondre à la question donnée. Chaque mot-clé doit être un mot pertinent
					pour la recherche et pas une concaténation de plusieurs mots clés ensemble (ex: 'VCT2025' au lieu de
					'VCT 2025'). Adapte les dates des mots clés sachant que la date d'aujourd'hui (au format ISO) est 
					${new Date().toISOString()}.

					- Si la question ne permet pas d’identifier au moins 2 mots-clés (par exemple, si elle est vide ou 
					dénuée de sens), retourne une chaine vide.
					- Si plus de 10 mots-clés sont trouvés, sélectionne les 10 plus importants.
					- Classe les mots-clés par ordre d'importance décroissante pour répondre à la question.

					### Format de sortie
					Retourne le résultat au format suivant :
					"motclé1 motclé2 ..."
					Chaque élément doit être une chaîne représentant un mot-clé pertinent.`,
				},
				{
					role: "user",
					content: title,
				},
			],
			text: { verbosity: "low" },
		});

		if (response.output_text === "")
			throw new Error("L'IA n'a pas pu identifier au moins 2 mots clés");

		return response.output_text || "";
	}

	/**
	 * Modifie les pronostics pour une prédiction donnée. Utilise les API LangSearch et OpenAI pour rechercher
	 * des documents pertinents. Si l'option ENABLE_AI_PRONOSTICS est désactivée, la méthode ne fait rien.
	 * @param id L'identifiant de la prédiction pour laquelle générer les options
	 * @throws Error si la clé API OpenAI est absente, ou si aucune option n'es passée à l'IA
	 */
	async updatePronosticsByAI(id: string) {
		if (this.configService.get<string>("ENABLE_AI_PRONOSTICS") === "true") {
			const OPENAI_API_KEY =
				this.configService.get<string>("OPENAI_API_KEY");
			if (!OPENAI_API_KEY) throw new Error("Clé API OpenAI manquante");
		}
		else return;

		// Préparation des documents pour la prédiction de l'IA
		const prediction = await this.getById(id);
		if (!prediction) throw new Error("Prédiction non trouvée");

		const query = await this.getQueryFromTitle(prediction.title);
		const startTime = Date.now();
		const documents = await this.queryWebSearch(query);

		// S'assurer qu'au moins une seconde s'ecoule entre les appels à l'API LangSearch
		await new Promise((resolve) =>
			setTimeout(resolve, Math.max(3000 - (Date.now() - startTime), 0)),
		);
		const rankedDocuments = await this.rerankDocuments(
			prediction.title,
			documents,
		);

		const client = new OpenAI();
		const response = await client.responses.create({
			model: "gpt-5-nano",
			input: [
				{
					role: "developer",
					content: `En te basant sur les documents fournis, attribue à chaque option une probabilité comprise 
					entre 0 et 100, de façon à ce que la somme totale des probabilités soit exactement 100. Chaque 
					probabilité doit être donnée au format nombre flottant, avec un maximum de deux décimales, et 
					représenter la probabilité que l'option réponde correctement à la question posée.

					Avant de commencer, établis une checklist concise (3 à 5 points) pour t'assurer que toutes les étapes 
					requises sont prises en compte : (1) identifier les options, (2) analyser les documents, (3) évaluer 
					chaque option, (4) attribuer les probabilités, (5) vérifier que la somme fait bien 100.
					
					Après avoir attribué les probabilités ou généré une erreur, vérifie brièvement la structure et la 
					validité de la sortie (format, somme des probabilités, présence ou absence d’options), puis indique 
					si une correction est nécessaire ou si le résultat est prêt.

					## Format de sortie
					- Si des options sont présentes :
					\`\`\`json
					{
					"option1": nombre, // Probabilité de 0 à 100 (flottant possible)
					"option2": nombre,
					...
					}
					\`\`\`
					- Si aucune option n'est fournie :
					\`\`\`json
					{
					"error": "Aucune option fournie."
					}
					\`\`\`
					- Si tu ne peux pas répondre à la question avec les documents fournis :
					\`\`\`json
					{
					"error": "Impossible de répondre à la question avec les documents fournis."
					}
					TU NE DOIS RÉPONDRE QUE PAR L'OBJECT JSON, RIEN D'AUTRE, PAS MEME DE STYLAGE MARKDOWN. LA REPONSE 
					DOIT POUVOIR ETRE PARSÉE DIRECTEMENT EN JSON. SI TU NE PEUX PAS RÉPONDRE, UTILISE LE FORMAT D'ERREUR
					CI-DESSUS. REMPLACE LA CLEF "option1", "option2", ... PAR LES OPTIONS RÉELLES QUI TE SONT FOURNIES.
					\`\`\``,
				},
				{
					role: "user",
					content: `Documents : ${rankedDocuments.join("\n\n")}\n\nQuestion : ${prediction.title}\n\nOptions : ${Object.keys(prediction.options).join(", ")}`,
				},
			],
			text: { verbosity: "low" },
		});
		const parsedResponse = JSON.parse(response.output_text) || {};
		if (parsedResponse.error) throw new Error(parsedResponse.error);

		prediction.pronostics_ia = parsedResponse;
		await this.predictionModel.findByIdAndUpdate(id, prediction);
	}
}
