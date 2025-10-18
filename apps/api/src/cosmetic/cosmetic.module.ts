import { Module } from "@nestjs/common";
import { CosmeticController } from "./cosmetic.controller";
import { CosmeticService } from "./cosmetic.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Cosmetic, CosmeticSchema } from "./cosmetic.schema";
import { AuthModule } from "../guards/auth.module";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Cosmetic.name, schema: CosmeticSchema },
		]),
		AuthModule,
	],
	controllers: [CosmeticController],
	providers: [CosmeticService],
	exports: [CosmeticService],
})
export class CosmeticModule {}
