import { Module } from "@nestjs/common";
import { SeedService } from "./seed.service";
import { CosmeticModule } from "../cosmetic/cosmetic.module";
import { UserModule } from "../user/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Cosmetic, CosmeticSchema } from "../cosmetic/cosmetic.schema";
import { User, UserSchema } from "../user/user.schema";

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
