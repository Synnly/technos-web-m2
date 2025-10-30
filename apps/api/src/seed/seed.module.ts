import { Module } from "@nestjs/common";
import { SeedService } from "./seed.service";
import { CosmeticModule } from "src/cosmetic/cosmetic.module";
import { UserModule } from "src/user/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Cosmetic, CosmeticSchema } from "src/cosmetic/cosmetic.schema";
import { User, UserSchema } from "src/user/user.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Cosmetic.name, schema: CosmeticSchema },
			{ name: User.name, schema: UserSchema },
		]),
		CosmeticModule,
		UserModule,
	],
	controllers: [],
	providers: [SeedService],
	exports: [SeedService],
})
export class SeedModule {}
