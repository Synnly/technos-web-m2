import Agenda from "agenda";
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PredictionService } from "./prediction.service";
import { Prediction } from "./prediction.schema";

@Injectable()
export class PronosticQueueManagerService
	implements OnModuleInit, OnModuleDestroy
{
	private agenda: Agenda;

	/**
	 * Construit le PronosticQueueManager. Le manager utilise Agenda pour gérer une file de tâches.
	 * Les taches sont verifiées toutes les 30 secondes.
	 * @param predictionService Le service de prédiction.
	 */
	constructor(private predictionService: PredictionService) {
		const dbUrl = process.env.DATABASE_URL;
		if (!dbUrl) {
			throw new Error(
				"La variable d'environnement DATABASE_URL n'est pas définie",
			);
		}

		this.agenda = new Agenda({
			db: { address: dbUrl, collection: "predictionJobs" },
			processEvery: "30 seconds",
			maxConcurrency: 1,
		});

		// Ajouter des event listeners pour débugger
		this.agenda.on("ready", async () => {
			this.initializeJobs();

			await this.agenda.every("0 0 0 * * *", "update ai pronostics");
		});
	}

	/**
	 * Gère le démarrage du gestionnaire de file d'attente lors de l'initialisation du module.
	 */
	async onModuleInit() {
		await this.start();
	}

	/**
	 * Gère l'arrêt propre du gestionnaire de file d'attente lors de la terminaison du module.
	 */
	async onModuleDestroy() {
		await this.stop();
	}

	/**
	 * Démarre le gestionnaire de file d'attente et programme la tâche quotidienne.
	 * Ajoute une tâche quotidienne pour mettre à jour les pronostics de l'ia à minuit.
	 */
	async start() {
		await this.agenda.start();
		// console.log(await this.agenda.jobs());
	}

	/**
	 * Arrête le gestionnaire de file d'attente.
	 */
	async stop() {
		await this.agenda.stop();
	}

	/**
	 * Initialise les différents types de jobs gérés par Agenda.
	 */
	initializeJobs() {
		// Job pour traiter une requête individuelle
		this.agenda.define("execute request", async (job) => {
			const { prediction } = job.attrs.data;
			await this.executeRequest(prediction);
		});

		// Job quotidien pour mettre à jour les pronostics
		this.agenda.define("update ai pronostics", async (job) => {
			await this.updateAIPronostics();
		});
	}

	/**
	 * Ajoute dans la file d'attente les tâches pour mettre à jour les pronostics de l'IA
	 * pour toutes les prédictions valides.
	 */
	async updateAIPronostics() {
		const validPredictions =
			await this.predictionService.getValidPredictions();

		for (const prediction of validPredictions) {
			await this.agenda.now("execute request", {
				prediction: prediction,
			});
		}
	}

	/**
	 * Exécute une requête de pronostic pour une prédiction donnée.
	 * @param prediction La prédiction
	 */
	async executeRequest(prediction: Prediction) {
		await this.predictionService.updatePronosticsByAI(prediction._id);
	}
}
