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
import { UpdateUserDto } from "../../src/user/dto/updateuser.dto";
import { Cosmetic, CosmeticType } from "../../src/cosmetic/cosmetic.schema";
import { CosmeticService } from "../../src/cosmetic/cosmetic.service";
import { log } from "console";

describe("User Integration Tests", () => {
	let app: INestApplication;
	let moduleRef: TestingModule;
	let mongoServer: MongoMemoryServer;
	let userService: UserService;
	let cosmeticService: CosmeticService;
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

	const cosmetic1 = {
		name: "Cosmetic 1",
		cost: 100,
		type: CosmeticType.BADGE,
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
						secret: configService.get<string>("JWT_SECRET"),
						signOptions: { expiresIn: "1h" },
					}),
					inject: [ConfigService],
				}),
				MongooseModule.forRoot(mongoUri),
				CosmeticModule,
				PublicationModule,
				VoteModule,
				PredictionModule,
				UserModule,
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
		cosmeticService = moduleRef.get<CosmeticService>(CosmeticService);

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

		// Création d'un cosmétique de test
		await cosmeticService.create(cosmetic1 as Cosmetic);
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

	describe("GET /api/user/:username", () => {
		it("should return user data for own profile", async () => {
			const response = await request(app.getHttpServer())
				.get(`/api/user/${testUser.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);

			expect(response.body.username).toBe(testUser.username);
			expect(response.body.motDePasse).toBeUndefined();
		});

		it("should return 403 when accessing other user profile as regular user", async () => {
			await request(app.getHttpServer())
				.get(`/api/user/${testAdmin.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.FORBIDDEN);
		});

		it("should allow admin to access any user profile", async () => {
			const response = await request(app.getHttpServer())
				.get(`/api/user/${testUser.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);

			expect(response.body.username).toBe(testUser.username);
		});

		it("should return 404 for non-existent user", async () => {
			await request(app.getHttpServer())
				.get("/api/user/nonexistent")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});
	});

	describe("PUT /api/user/:username", () => {
		it("should update user password for own profile", async () => {
			const updateData = {
				username: testUser.username,
				motDePasse: "NewPassword123!",
			};

			await request(app.getHttpServer())
				.put(`/api/user/${testUser.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send(updateData)
				.expect(HttpStatus.OK);

			// Vérifier que le mot de passe a été mis à jour
			const loginResponse = await request(app.getHttpServer())
				.post("/api/user/login")
				.send({ username: testUser.username, password: "NewPassword123!" })
				.expect(HttpStatus.CREATED);

			expect(loginResponse.body.token).toBeDefined();

			// Réinitialiser le mot de passe pour les autres tests
			await userService.createOrUpdateByUsername(
				testUser.username,
				new UpdateUserDto({
					username: testUser.username,
					motDePasse: testUser.motDePasse,
				}),
			);
		});

		it("should create user if it doesn't exist", async () => {
			const newUser = {
				username: "newuser",
				motDePasse: "NewPassword123!",
			};

			await request(app.getHttpServer()).post("/api/user").send(newUser).expect(HttpStatus.CREATED);
		});

		it("should return 400 with invalid password format", async () => {
			const updateData = {
				username: testUser.username,
				motDePasse: "weak",
			};

			await request(app.getHttpServer())
				.put(`/api/user/${testUser.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send(updateData)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 403 when updating other user as regular user", async () => {
			const updateData = {
				username: testAdmin.username,
				motDePasse: "NewPassword123!",
			};

			await request(app.getHttpServer())
				.put(`/api/user/${testAdmin.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send(updateData)
				.expect(HttpStatus.FORBIDDEN);
		});

		it("should allow admin to update any user", async () => {
			const updateData = {
				username: testUser.username,
				points: 1000,
				role: Role.USER,
			};

			await request(app.getHttpServer())
				.put(`/api/user/${testUser.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(updateData)
				.expect(HttpStatus.OK);

			const updatedUser = await userService.getByUsername(testUser.username);
			expect(updatedUser!.points).toBe(1000);
		});
	});

	describe("DELETE /api/user/:username", () => {
		it("should allow user to delete own account", async () => {
			const tempUser = {
				username: "tempuser",
				motDePasse: "TempPass123!",
			};

			await userService.createUser(tempUser);

			const loginResponse = await request(app.getHttpServer())
				.post("/api/user/login")
				.send({ username: tempUser.username, password: tempUser.motDePasse });

			const tempToken = loginResponse.body.token.token;

			await request(app.getHttpServer())
				.delete(`/api/user/${tempUser.username}`)
				.set("Authorization", `Bearer ${tempToken}`)
				.expect(HttpStatus.OK);

			const deletedUser = await userService.getByUsername(tempUser.username);
			expect(deletedUser).toBeUndefined();
		});

		it("should return 403 when trying to delete other user as regular user", async () => {
			await request(app.getHttpServer())
				.delete(`/api/user/${testAdmin.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.FORBIDDEN);
		});

		it("should allow admin to delete any user", async () => {
			const tempUser = {
				username: "tempuser2",
				motDePasse: "TempPass123!",
			};

			await userService.createUser(tempUser);

			await request(app.getHttpServer())
				.delete(`/api/user/${tempUser.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);

			const deletedUser = await userService.getByUsername(tempUser.username);
			expect(deletedUser).toBeUndefined();
		});
	});

	describe("POST /api/user/login", () => {
		it("should return JWT token with valid credentials", async () => {
			const response = await request(app.getHttpServer())
				.post("/api/user/login")
				.send({
					username: testUser.username,
					password: testUser.motDePasse,
				})
				.expect(HttpStatus.CREATED);

			expect(response.body.token.token).toBeDefined();
			expect(typeof response.body.token.token).toBe("string");
		});

		it("should return 401 with invalid credentials", async () => {
			await request(app.getHttpServer())
				.post("/api/user/login")
				.send({
					username: testUser.username,
					password: "wrongpassword",
				})
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it("should return 400 with missing password", async () => {
			await request(app.getHttpServer())
				.post("/api/user/login")
				.send({
					username: testUser.username,
				})
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 with missing username", async () => {
			await request(app.getHttpServer())
				.post("/api/user/login")
				.send({
					password: testUser.motDePasse,
				})
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe("GET /api/user/:username/daily-reward", () => {
		it("should claim daily reward successfully", async () => {
			const userBefore = await userService.getByUsername(testUser.username);
			const initialPoints = userBefore!.points;

			const response = await request(app.getHttpServer())
				.get(`/api/user/${testUser.username}/daily-reward`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);

			expect(response.body.reward).toBeDefined();
			const updatedUser = await userService.getByUsername(testUser.username);
			expect(updatedUser!.points).toBe(initialPoints + response.body.reward);

			// Réinitialiser la date de dernière récompense pour les autres tests
			await userService.createOrUpdateByUsername(
				testUser.username,
				new UpdateUserDto({
					username: testUser.username,
					points: initialPoints,
					dateDerniereRecompenseQuotidienne: null,
				}),
			);
		});

		it("should return 403 when claiming reward for other user", async () => {
			await request(app.getHttpServer())
				.get(`/api/user/${testAdmin.username}/daily-reward`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.FORBIDDEN);
		});

		it("should return 400 when claiming reward twice in the same day", async () => {
			const userBefore = await userService.getByUsername(testUser.username);
			const initialPoints = userBefore!.points;

			const result = await request(app.getHttpServer())
				.get(`/api/user/${testUser.username}/daily-reward`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);

			await request(app.getHttpServer())
				.get(`/api/user/${testUser.username}/daily-reward`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.BAD_REQUEST);

			await userService.createOrUpdateByUsername(
				testUser.username,
				new UpdateUserDto({
					username: testUser.username,
					dateDerniereRecompenseQuotidienne: null,
					points: initialPoints,
				}),
			);
		});
	});

	describe("POST /:username/buy/cosmetic/:cosmeticId", () => {
		it("should return 201 when buying cosmetic for self", async () => {
			const cosmeticId = await cosmeticService.findAll().then((cosmetics) => cosmetics[0]._id);
			const cosmeticIdStr = cosmeticId.toString();
			await request(app.getHttpServer())
				.post(`/api/user/${testUser.username}/buy/cosmetic/${cosmeticIdStr}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.CREATED);

			const updatedUser = await userService.getByUsername(testUser.username);
			expect(updatedUser).toBeDefined();

			expect(updatedUser!.cosmeticsOwned.map((cosmetic) => cosmetic.toString())).toContain(cosmeticId.toString());

			// Réinitialiser les données de l'utilisateur pour les autres tests
			await userService.createOrUpdateByUsername(
				testUser.username,
				new UpdateUserDto({
					username: testUser.username,
					points: updatedUser!.points + cosmetic1.cost,
					cosmeticsOwned: [],
				}),
			);
		});

		it("should return 403 when buying cosmetic for other user", async () => {
			const cosmeticId = await cosmeticService.findAll().then((cosmetics) => cosmetics[0]._id.toString());
			const cosmeticIdStr = cosmeticId.toString();
			await request(app.getHttpServer())
				.post(`/api/user/${testAdmin.username}/buy/cosmetic/${cosmeticIdStr}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.FORBIDDEN);
		});

		it("should return 400 when buying already owned cosmetic", async () => {
			const cosmeticId = await cosmeticService.findAll().then((cosmetics) => cosmetics[0]._id.toString());
			const cosmeticIdStr = cosmeticId.toString();
			// Acheter le cosmétique une première fois
			await request(app.getHttpServer())
				.post(`/api/user/${testUser.username}/buy/cosmetic/${cosmeticIdStr}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.CREATED);

			const updatedUser = await userService.getByUsername(testUser.username);
			expect(updatedUser).toBeDefined();
			expect(updatedUser!.cosmeticsOwned.map((cosmetic) => cosmetic.toString())).toContain(cosmeticId);

			// Tenter de l'acheter à nouveau
			await request(app.getHttpServer())
				.post(`/api/user/${testUser.username}/buy/cosmetic/${cosmeticIdStr}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});
	});
});
