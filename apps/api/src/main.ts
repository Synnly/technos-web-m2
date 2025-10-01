import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

/**
 * Initialise l'application NestJS.
 *
 * Cette fonction initialise l'application en créant une instance du
 * `AppModule` à l'aide de `NestFactory`. Elle active également le partage
 * des ressources entre origines (CORS) avec des configurations spécifiques,
 * telles que les origines autorisées, les méthodes HTTP et les informations
 * d'identification. Enfin, elle démarre l'application en écoutant sur le port
 * spécifié ou par défaut sur le port 3000.
 *
 * Variables d'environnement :
 * - `CLIENT_URL` : Spécifie l'origine autorisée pour CORS. Par défaut `http://localhost:5173`.
 * - `PORT` : Spécifie le port sur lequel l'application écoutera. Par défaut `3000`.
 *
 * @async
 * @function
 * @returns {Promise<void>} Une promesse qui se résout lorsque l'application a démarré.
 */
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		// origin: [process.env.CLIENT_URL ?? 'http://localhost:5173'],
		origin: "*",
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		credentials: true,
	});
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
