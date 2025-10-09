import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { PredictionModule } from "./prediction/prediction.module";
import { VoteModule } from "./vote/vote.module";
import { PublicationModule } from "./publication/publication.module";
import { CosmeticModule } from "./cosmetic/cosmetic.module";
import { JwtModule } from "@nestjs/jwt";

/**
 * Module principal de l'application.
 * Configure les connexions à la base de données, les modules JWT et les middlewares.
 */
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Permet d'utiliser ConfigModule dans toute l'application sans le réimporter
		}),
		MongooseModule.forRoot(process.env.DATABASE_URL!),
		UserModule,
		PredictionModule,
		VoteModule,
		PublicationModule,
		CosmeticModule,
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET!, // <-- nécessaire
			signOptions: { expiresIn: "2h" },
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {}
}
