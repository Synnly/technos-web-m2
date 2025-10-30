import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { PredictionModule } from "./prediction/prediction.module";
import { VoteModule } from "./vote/vote.module";
import { PublicationModule } from "./publication/publication.module";
import { CosmeticModule } from "./cosmetic/cosmetic.module";
import { SeedModule } from "./seed/seed.module";
import { JwtModule } from "@nestjs/jwt";
import { UserMiddleware } from "./middleware/user.middleware";

/**
 * Module principal de l'application.
 * Configure les connexions à la base de données, les modules JWT et les middlewares.
 */
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Permet d'utiliser ConfigModule dans toute l'application sans le réimporter
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>("DATABASE_URL"),
			}),
			inject: [ConfigService],
		}),
		UserModule,
		PredictionModule,
		VoteModule,
		PublicationModule,
		CosmeticModule,
		SeedModule,
		JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: "2h" },
            }),
            inject: [ConfigService],
        }),
	],
	controllers: [],
	providers: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(UserMiddleware).forRoutes("*");
	}
}
