import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { isAuthenticated } from './app.middleware';
import { UserService } from './service/user.service';
import { User, UserSchema } from './model/user.schema';
import { UserController } from './controller/user.controller';
import { PredictionController } from './controller/prediction.controller';
import { PredictionService } from './service/prediction.service';
import { Prediction, PredictionSchema } from './model/prediction.schema';
import { TokenController } from './controller/token.controller';
import { VoteService } from './service/vote.service';
import { Vote, VoteSchema } from './model/vote.schema';
import { VoteController } from './controller/vote.controller';
import { Publication, PublicationSchema } from './model/publication.schema';
import { PublicationService } from './service/publication.service';
import { PublicationController } from './controller/publication.controller';

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
		]),
		JwtModule.register({
			secret: process.env.JWT_SECRET!,
			signOptions: { expiresIn: '2h' },
		}),
	],
	controllers: [UserController, PredictionController, TokenController, VoteController, PublicationController],
	providers: [UserService, PredictionService, VoteService, PublicationService],
})

export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer){
		consumer
			.apply(isAuthenticated)
			.forRoutes('/api/vote');
	}
}
