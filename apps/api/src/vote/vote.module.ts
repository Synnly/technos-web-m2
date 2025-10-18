import { forwardRef, Module } from "@nestjs/common";
import { VoteService } from "./vote.service";
import { VoteController } from "./vote.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Vote, VoteSchema } from "./vote.schema";
import { UserModule } from "../user/user.module";
import { PredictionModule } from "../prediction/prediction.module";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
		forwardRef(() => UserModule),
		forwardRef(() => PredictionModule)
	],
	controllers: [VoteController],
	providers: [VoteService],
	exports: [MongooseModule, VoteService],
})
export class VoteModule {}
