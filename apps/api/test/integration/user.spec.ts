import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserModule } from "../../src/user/user.module";
import { UserService } from "../../src/user/user.service";
import { Role } from "../../src/user/user.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { VoteModule } from "../../src/vote/vote.module";
import { PredictionModule } from "../../src/prediction/prediction.module";
import { PublicationModule } from "../../src/publication/publication.module";
import { CosmeticModule } from "../../src/cosmetic/cosmetic.module";
import { AuthModule } from "../../src/guards/auth.module";

describe("User Integration Tests", () => {
	let app: INestApplication;
	let moduleRef: TestingModule;
	let mongoServer: MongoMemoryServer;
	let userService: UserService;
	let adminToken: string;
	let userToken: string;

	// Données de test
	const testUser = {
		username: "testuser",
		motDePasse: "TestPass123!",
	};

	const testAdmin = {
		username: "admin",
		motDePasse: "AdminPass123!",
		role: Role.ADMIN,
	};

	beforeAll(async () => {
		// Configuration MongoDB en mémoire
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();

		// Configuration du module de test
		moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [
						() => ({
							DATABASE_URL: mongoUri,
							NODE_ENV: "test",
						}),
					],
				}),
				JwtModule.registerAsync({
                    global: true,
                    useFactory: (configService: ConfigService) => ({
                        secret: configService.get<string>('JWT_SECRET'),
                        signOptions: { expiresIn: '1h' },
                    }),
                    inject: [ConfigService],
                }),
				MongooseModule.forRoot(mongoUri),
				CosmeticModule,
                PublicationModule,
                VoteModule,
                PredictionModule,
                UserModule
			],
		}).compile();

		// Création de l'application
		app = moduleRef.createNestApplication();

		// Configuration des pipes globaux
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			}),
		);

		await app.init();

		userService = moduleRef.get<UserService>(UserService);

		// Création des utilisateurs de test
		await userService.createUser(testUser);
		await userService.createUser(testAdmin);
		await userService.setAdmin(testAdmin.username);
		

		// Génération des tokens
		const userLoginResponse = await request(app.getHttpServer())
			.post("/api/user/login")
			.send({ username: testUser.username, password: testUser.motDePasse });

		userToken = userLoginResponse.body.token.token;

		const adminLoginResponse = await request(app.getHttpServer())
			.post("/api/user/login")
			.send({ username: testAdmin.username, password: testAdmin.motDePasse });
		adminToken = adminLoginResponse.body.token.token;
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	describe("POST /api/user", () => {
		it("should create a new user with valid data", async () => {
			const newUser = {
				username: "newuser",
				motDePasse: "NewPass123!",
			};

			await request(app.getHttpServer()).post("/api/user").send(newUser).expect(HttpStatus.CREATED);

			const createdUser = await userService.getByUsername(newUser.username);
			expect(createdUser).toBeDefined();
			expect(createdUser!.username).toBe(newUser.username);

			await userService.deleteByUsername(newUser.username);
		});

		it("should return 400 when username is missing", async () => {
			const invalidUser = {
				motDePasse: "ValidPass123!",
			};

			await request(app.getHttpServer()).post("/api/user").send(invalidUser).expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when password is weak", async () => {
			const invalidUser = {
				username: "testuser2",
				motDePasse: "weak",
			};

			await request(app.getHttpServer()).post("/api/user").send(invalidUser).expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when user already exists", async () => {
			const duplicateUser = {
				username: testUser.username,
				motDePasse: "ValidPass123!",
			};

			await request(app.getHttpServer()).post("/api/user").send(duplicateUser).expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe("GET /api/user", () => {
		it("should return all users for admin", async () => {
			const response = await request(app.getHttpServer())
				.get("/api/user")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(2);
		});

		it("should return 403 for non-admin users", async () => {
			await request(app.getHttpServer())
				.get("/api/user")
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.FORBIDDEN);
		});

		it("should return 401 without authentication", async () => {
			await request(app.getHttpServer()).get("/api/user").expect(HttpStatus.UNAUTHORIZED);
		});
	});

	// describe("GET /api/user/:username", () => {
	// 	it("should return user data for own profile", async () => {
	// 		const response = await request(app.getHttpServer())
	// 			.get(`/api/user/${testUser.username}`)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.expect(200);

	// 		expect(response.body.username).toBe(testUser.username);
	// 		expect(response.body.motDePasse).toBeUndefined(); // Password should not be returned
	// 	});

	// 	it("should return 403 when accessing other user profile as regular user", async () => {
	// 		await request(app.getHttpServer())
	// 			.get(`/api/user/${testAdmin.username}`)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.expect(403);
	// 	});

	// 	it("should allow admin to access any user profile", async () => {
	// 		const response = await request(app.getHttpServer())
	// 			.get(`/api/user/${testUser.username}`)
	// 			.set("Authorization", `Bearer ${adminToken}`)
	// 			.expect(200);

	// 		expect(response.body.username).toBe(testUser.username);
	// 	});

	// 	it("should return 404 for non-existent user", async () => {
	// 		await request(app.getHttpServer())
	// 			.get("/api/user/nonexistent")
	// 			.set("Authorization", `Bearer ${adminToken}`)
	// 			.expect(404);
	// 	});
	// });

	// describe("PUT /api/user/:username", () => {
	// 	it("should update user password for own profile", async () => {
	// 		const updateData = {
	// 			motDePasse: "NewPassword123!",
	// 		};

	// 		await request(app.getHttpServer())
	// 			.put(`/api/user/${testUser.username}`)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.send(updateData)
	// 			.expect(200);

	// 		// Vérifier que le mot de passe a été mis à jour
	// 		const loginResponse = await request(app.getHttpServer())
	// 			.post("/api/user/login")
	// 			.send({ username: testUser.username, password: "NewPassword123!" })
	// 			.expect(200);

	// 		expect(loginResponse.body.token).toBeDefined();
	// 	});

	// 	it("should return 400 with invalid password format", async () => {
	// 		const updateData = {
	// 			motDePasse: "weak",
	// 		};

	// 		const response = await request(app.getHttpServer())
	// 			.put(`/api/user/${testUser.username}`)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.send(updateData)
	// 			.expect(400);

	// 		expect(response.body.message).toContain("motDePasse");
	// 	});

	// 	it("should return 403 when updating other user as regular user", async () => {
	// 		const updateData = {
	// 			motDePasse: "NewPassword123!",
	// 		};

	// 		await request(app.getHttpServer())
	// 			.put(`/api/user/${testAdmin.username}`)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.send(updateData)
	// 			.expect(403);
	// 	});

	// 	it("should allow admin to update any user", async () => {
	// 		const updateData = {
	// 			points: 1000,
	// 			role: Role.USER,
	// 		};

	// 		await request(app.getHttpServer())
	// 			.put(`/api/user/${testUser.username}`)
	// 			.set("Authorization", `Bearer ${adminToken}`)
	// 			.send(updateData)
	// 			.expect(200);

	// 		const updatedUser = await userService.getByUsername(testUser.username);
	// 		expect(updatedUser.points).toBe(1000);
	// 	});
	// });

	// describe("DELETE /api/user/:username", () => {
	// 	it("should allow user to delete own account", async () => {
	// 		// Créer un utilisateur temporaire pour le test
	// 		const tempUser = {
	// 			username: "tempuser",
	// 			motDePasse: "TempPass123!",
	// 		};

	// 		await userService.createUser(tempUser);

	// 		const loginResponse = await request(app.getHttpServer())
	// 			.post("/api/user/login")
	// 			.send({ username: tempUser.username, password: tempUser.motDePasse });

	// 		const tempToken = loginResponse.body.token;

	// 		await request(app.getHttpServer())
	// 			.delete(`/api/user/${tempUser.username}`)
	// 			.set("Authorization", `Bearer ${tempToken}`)
	// 			.expect(200);

	// 		// Vérifier que l'utilisateur a été supprimé
	// 		const deletedUser = await userService.getByUsername(tempUser.username);
	// 		expect(deletedUser).toBeNull();
	// 	});

	// 	it("should return 403 when trying to delete other user as regular user", async () => {
	// 		await request(app.getHttpServer())
	// 			.delete(`/api/user/${testAdmin.username}`)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.expect(403);
	// 	});

	// 	it("should allow admin to delete any user", async () => {
	// 		// Créer un utilisateur temporaire pour le test
	// 		const tempUser = {
	// 			username: "tempuser2",
	// 			motDePasse: "TempPass123!",
	// 		};

	// 		await userService.createUser(tempUser);

	// 		await request(app.getHttpServer())
	// 			.delete(`/api/user/${tempUser.username}`)
	// 			.set("Authorization", `Bearer ${adminToken}`)
	// 			.expect(200);

	// 		const deletedUser = await userService.getByUsername(tempUser.username);
	// 		expect(deletedUser).toBeNull();
	// 	});
	// });

	// describe("POST /api/user/login", () => {
	// 	it("should return JWT token with valid credentials", async () => {
	// 		const response = await request(app.getHttpServer())
	// 			.post("/api/user/login")
	// 			.send({
	// 				username: testUser.username,
	// 				password: testUser.motDePasse,
	// 			})
	// 			.expect(200);

	// 		expect(response.body.token).toBeDefined();
	// 		expect(typeof response.body.token).toBe("string");
	// 	});

	// 	it("should return 401 with invalid credentials", async () => {
	// 		await request(app.getHttpServer())
	// 			.post("/api/user/login")
	// 			.send({
	// 				username: testUser.username,
	// 				password: "wrongpassword",
	// 			})
	// 			.expect(401);
	// 	});

	// 	it("should return 400 with missing credentials", async () => {
	// 		await request(app.getHttpServer())
	// 			.post("/api/user/login")
	// 			.send({
	// 				username: testUser.username,
	// 			})
	// 			.expect(400);
	// 	});
	// });

	// describe("GET /api/user/:username/daily-reward", () => {
	// 	it("should claim daily reward successfully", async () => {
	// 		const response = await request(app.getHttpServer())
	// 			.get(`/api/user/${testUser.username}/daily-reward`)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.expect(200);

	// 		expect(response.body.reward).toBeDefined();
	// 		expect(response.body.newPoints).toBeDefined();
	// 	});

	// 	it("should return 403 when claiming reward for other user", async () => {
	// 		await request(app.getHttpServer())
	// 			.get(`/api/user/${testAdmin.username}/daily-reward`)
	// 			.set("Authorization", `Bearer ${userToken}`)
	// 			.expect(403);
	// 	});
	// });
});
