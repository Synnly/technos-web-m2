import {
	MiddlewareConsumer,
	Module,
	NestModule,
} from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { User, UserSchema } from "./user/user.schema";
import { Prediction, PredictionSchema } from "./prediction/prediction.schema";
import { Vote, VoteSchema } from "./vote/vote.schema";
import {
	Publication,
	PublicationSchema,
} from "./publication/publication.schema";
import { Cosmetic, CosmeticSchema } from "./cosmetic/cosmetic.schema";

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
	controllers: [],
	providers: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {}
}
