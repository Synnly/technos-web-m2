import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { TokenController } from "./token.controller";
import { UserService } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { AuthModule } from "src/guards/auth.module";
import { CosmeticModule } from "src/cosmetic/cosmetic.module";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		AuthModule,
		CosmeticModule,
	],
	controllers: [UserController, TokenController],
	providers: [UserService],
	exports: [MongooseModule, AuthModule],
})
export class UserModule {}
