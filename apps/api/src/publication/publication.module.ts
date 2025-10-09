import { Module } from "@nestjs/common";
import { PublicationController } from "./publication.controller";
import { PublicationService } from "./publication.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Publication, PublicationSchema } from "./publication.schema";
import { AuthModule } from "src/guards/auth.module";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Publication.name, schema: PublicationSchema },
		]),
		AuthModule,
	],
	controllers: [PublicationController],
	providers: [PublicationService],
})
export class PublicationModule {}
