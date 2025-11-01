import { Module } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { JwtModule } from "@nestjs/jwt";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET!,
			signOptions: { expiresIn: "2h" },
		}),
	],
	controllers: [],
	providers: [AuthGuard, JwtModule],
	exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
