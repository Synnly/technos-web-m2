import { forwardRef, Module } from "@nestjs/common";
import { PredictionService } from "./prediction.service";
import { PredictionController } from "./prediction.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Prediction, PredictionSchema } from "./prediction.schema";
import { UserModule } from "../user/user.module";
import { VoteModule } from "src/vote/vote.module";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Prediction.name, schema: PredictionSchema },
		]),
		forwardRef(() => UserModule),
		forwardRef(() => VoteModule),
	],
	controllers: [PredictionController],
	providers: [PredictionService],
	exports: [MongooseModule, PredictionService],
})
export class PredictionModule {}