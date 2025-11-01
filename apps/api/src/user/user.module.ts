import { forwardRef, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { TokenController } from "./token.controller";
import { UserService } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { AuthModule } from "../guards/auth.module";
import { CosmeticModule } from "../cosmetic/cosmetic.module";
import { PredictionModule } from "../prediction/prediction.module";
import { VoteModule } from "../vote/vote.module";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		AuthModule,
		CosmeticModule,
		forwardRef(() => PredictionModule),
		forwardRef(() => VoteModule),
	],
	controllers: [UserController, TokenController],
	providers: [UserService],
	exports: [MongooseModule, AuthModule],
})
export class UserModule {}
