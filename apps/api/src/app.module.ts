import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { isAuthenticated } from "./app.middleware";
import { UserService } from "./user/user.service";
import { User, UserSchema } from "./user/user.schema";
import { UserController } from "./user/user.controller";
import { PredictionController } from "./prediction/prediction.controller";
import { PredictionService } from "./prediction/prediction.service";
import { Prediction, PredictionSchema } from "./prediction/prediction.schema";
import { TokenController } from "./user/token.controller";
import { VoteService } from "./vote/vote.service";
import { Vote, VoteSchema } from "./vote/vote.schema";
import { VoteController } from "./vote/vote.controller";
import {
	Publication,
	PublicationSchema,
} from "./publication/publication.schema";
import { PublicationService } from "./publication/publication.service";
import { PublicationController } from "./publication/publication.controller";
import { PronosticQueueManagerService } from "./prediction/pronosticQueueManager.service";
import { Cosmetic, CosmeticSchema } from "./cosmetic/cosmetic.schema";
import { CosmeticService } from "./cosmetic/cosmetic.service";
import { CosmeticController } from "./cosmetic/cosmetic.controller";

/**
 * Module principal de l'application API.
 *
 * Ce module configure la configuration, la connexion à la base de données,
 * l'authentification JWT et le middleware pour l'application.
 * Il enregistre également les contrôleurs et services utilisés dans l'application.
 *
 * @module AppModule
 *
 * @description
 * - Configure le `ConfigModule` pour qu'il soit disponible globalement dans l'application.
 * - Établit une connexion à la base de données MongoDB en utilisant `MongooseModule`.
 * - Enregistre le schéma `User` avec Mongoose.
 * - Configure le `JwtModule` pour gérer les JSON Web Tokens (JWT) avec une clé secrète
 *   et une durée d'expiration de 2 heures.
 * - Enregistre les contrôleurs `AppController` et `UserController` pour gérer les requêtes HTTP.
 * - Fournit les services `AppService` et `UserService` pour la logique de l'application.
 * - Applique le middleware `isAuthenticated` à la route `/main`.
 *
 * @class
 * @method configure
 * @param consumer - Le `MiddlewareConsumer` utilisé pour appliquer le middleware aux routes.
 */
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Permet d'utiliser ConfigModule dans toute l'application sans le réimporter
		}),
		MongooseModule.forRoot(process.env.DATABASE_URL!),
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Prediction.name, schema: PredictionSchema },
			{ name: Vote.name, schema: VoteSchema },
			{ name: Publication.name, schema: PublicationSchema },
			{ name: Cosmetic.name, schema: CosmeticSchema },
		]),
		JwtModule.register({
			secret: process.env.JWT_SECRET!,
			signOptions: { expiresIn: "2h" },
		}),
	],
	controllers: [
		UserController,
		PredictionController,
		TokenController,
		VoteController,
		PublicationController,
		CosmeticController,
	],
	providers: [
		UserService,
		PredictionService,
		VoteService,
		PublicationService,
		PronosticQueueManagerService,
		CosmeticService,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(isAuthenticated)
			.exclude({ path: "/api/user/login", method: RequestMethod.POST }) // Login
			.exclude({ path: "/api/user", method: RequestMethod.POST }) // Create user
			.forRoutes(
				"/api/user",
				"/api/vote",
				"/api/prediction",
				"/api/publication",
				"/api/cosmetic",
			);
	}
}
