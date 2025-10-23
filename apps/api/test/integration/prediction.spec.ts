import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppModule } from "../../src/app.module";
import { UserService } from "../../src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { PredictionService } from "../../src/prediction/prediction.service";
import { CosmeticService } from "../../src/cosmetic/cosmetic.service";
import { CosmeticType } from "../../src/cosmetic/cosmetic.schema";
import { Role } from "../../src/user/user.schema";

describe("Prediction Integration Tests", () => {
	let app: INestApplication;
	let moduleRef: TestingModule;
	let mongoServer: MongoMemoryServer;
	let userService: UserService;
	let predictionService: PredictionService;
	let cosmeticService: CosmeticService;
	let jwtService: JwtService;

	const testUserData = {
		username: "ptestuser",
		motDePasse: "PTestPass123!",
		points: 100,
	};

	const testAdminData = {
		username: "ptestadmin",
		motDePasse: "PAdminPass123!",
		points: 100,
		role: Role.ADMIN,
	};

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const mongoUri = mongoServer.getUri();

		moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true, load: [() => ({ DATABASE_URL: mongoUri, NODE_ENV: "test" })] }),
				MongooseModule.forRoot(mongoUri),
				AppModule,
			],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
		await app.init();

		userService = moduleRef.get<UserService>(UserService);
		predictionService = moduleRef.get<PredictionService>(PredictionService);
		cosmeticService = moduleRef.get<CosmeticService>(CosmeticService);
		jwtService = moduleRef.get<JwtService>(JwtService);
	});

	let userToken: string;
	let adminToken: string;
	let createdPrediction: any;

	beforeEach(async () => {
		await userService.createUser(testUserData);
		await userService.createOrUpdateByUsername(testUserData.username, testUserData);
		await userService.createUser(testAdminData);
		await userService.setAdmin(testAdminData.username);

		// create a cosmetic to satisfy potential dependencies
		await cosmeticService.create({ name: "pcos", cost: 10, type: CosmeticType.BADGE, value: ":beginner:" } as any);

		// create tokens that include user _id so the AuthGuard populates req.user._id
		const createdUser = await userService.getByUsername(testUserData.username);
		if (!createdUser) throw new Error("Test setup: created user not found");
		userToken = jwtService.sign({
			username: (createdUser as any).username,
			role: (createdUser as any).role,
			_id: (createdUser as any)._id,
		});

		const createdAdmin = await userService.getByUsername(testAdminData.username);
		if (!createdAdmin) throw new Error("Test setup: created admin not found");
		adminToken = jwtService.sign({
			username: (createdAdmin as any).username,
			role: (createdAdmin as any).role,
			_id: (createdAdmin as any)._id,
		});
	});

	afterEach(async () => {
		const u = await userService.getByUsername(testUserData.username);
		const a = await userService.getByUsername(testAdminData.username);
		if (u) await userService.deleteById((u as any)._id || (u as any).id);
		if (a) await userService.deleteById((a as any)._id || (a as any).id);
		const allPreds = await predictionService.getAll();
		for (const p of allPreds) {
			try {
				await predictionService.deleteById(p._id as any);
			} catch (e) {}
		}
		const cos = await cosmeticService.findAll();
		for (const c of cos) {
			try {
				await cosmeticService.deleteById((c as any)._id);
			} catch (e) {}
		}
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	describe("POST /api/prediction", () => {
		it("should return 401 when creating without authentication", async () => {
			const payload = {
				title: "NoAuth",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			await request(app.getHttpServer()).post("/api/prediction").send(payload).expect(HttpStatus.UNAUTHORIZED);
		});

		it("should create a prediction with valid data", async () => {
			const payload = {
				title: "Test Prediction",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			const createResValidate = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			if (createResValidate.status !== HttpStatus.CREATED) {
				console.error("Create prediction failed body:", createResValidate.body, createResValidate.text);
			}
			expect(createResValidate.status).toBe(HttpStatus.CREATED);

			const all = await predictionService.getAll();
			expect(all.length).toBeGreaterThanOrEqual(1);
			createdPrediction = all[0];
		});

		it("should create a prediction with valid data (admin)", async () => {
			const payload = {
				title: "Admin Test Prediction",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			const createResValidate = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(createResValidate.status).toBe(HttpStatus.CREATED);

			const all = await predictionService.getAll();
			expect(all.length).toBeGreaterThanOrEqual(1);
		});

		it("should return 400 for invalid data (missing title)", async () => {
			const payload = {
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 for invalid data (missing title) (admin)", async () => {
			const payload = {
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when options are fewer than 2", async () => {
			const payload = {
				title: "Bad options",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0 },
				status: "waiting",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when options are fewer than 2 (admin)", async () => {
			const payload = {
				title: "Bad options",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0 },
				status: "waiting",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when dateFin is in the past", async () => {
			const payload = {
				title: "Past date",
				dateFin: new Date(Date.now() - 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when dateFin is in the past (admin)", async () => {
			const payload = {
				title: "Past date",
				dateFin: new Date(Date.now() - 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when title is too short", async () => {
			const payload = {
				title: "ab",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when title is too short (admin)", async () => {
			const payload = {
				title: "ab",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when status is invalid", async () => {
			const payload = {
				title: "Invalid status",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "not-a-status",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when status is invalid (admin)", async () => {
			const payload = {
				title: "Invalid status",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "not-a-status",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when trying to set result on create", async () => {
			const payload = {
				title: "Has result",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
				result: "A",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when trying to set result on create (admin)", async () => {
			const payload = {
				title: "Has result",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
				result: "A",
			};

			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.BAD_REQUEST);
		});
	});

	describe("GET /api/prediction", () => {
		it("should list predictions", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(res.body)).toBe(true);
		});

		it("should list predictions (admin)", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(res.body)).toBe(true);
		});
	});

	describe("status filtered endpoints", () => {
		it("should list waiting predictions", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/prediction/waiting")
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(res.body)).toBe(true);
		});

		it("should list waiting predictions (admin)", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/prediction/waiting")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(res.body)).toBe(true);
		});

		it("should list valid predictions", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/prediction/valid")
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(res.body)).toBe(true);
		});

		it("should list valid predictions (admin)", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/prediction/valid")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(res.body)).toBe(true);
		});

		it("should list expired predictions (array)", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/prediction/expired")
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(res.body)).toBe(true);
		});

		it("should list expired predictions (array) (admin)", async () => {
			const res = await request(app.getHttpServer())
				.get("/api/prediction/expired")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(res.body)).toBe(true);
		});
	});

	describe("GET /api/prediction/:id/timeline", () => {
		it("should return 400 when intervalMinutes missing or invalid", async () => {
			const payload = {
				title: "TimelineTest",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};
			const createRes = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(createRes.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			await request(app.getHttpServer())
				.get(`/api/prediction/${id}/timeline`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when intervalMinutes missing or invalid (admin)", async () => {
			const payload = {
				title: "TimelineTestAdmin",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};
			const createRes = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(createRes.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			await request(app.getHttpServer())
				.get(`/api/prediction/${id}/timeline`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return a timeline with valid params", async () => {
			const payload = {
				title: "TimelineOK",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};
			const createRes = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(createRes.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			const r = await request(app.getHttpServer())
				.get(`/api/prediction/${id}/timeline`)
				.query({ intervalMinutes: 1 })
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(r.body)).toBe(true);
		});

		it("should return a timeline with valid params (admin)", async () => {
			const payload = {
				title: "TimelineOKAdmin",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};
			const createRes = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(createRes.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			const r = await request(app.getHttpServer())
				.get(`/api/prediction/${id}/timeline`)
				.query({ intervalMinutes: 1 })
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(r.body)).toBe(true);
		});

		it("should return 400 when intervalMinutes is non-positive", async () => {
			const payload = {
				title: "TimelineNeg",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};
			const createRes = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(createRes.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			await request(app.getHttpServer())
				.get(`/api/prediction/${id}/timeline`)
				.query({ intervalMinutes: 0 })
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when intervalMinutes is non-positive (admin)", async () => {
			const payload = {
				title: "TimelineNegAdmin",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};
			const createRes = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(createRes.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			await request(app.getHttpServer())
				.get(`/api/prediction/${id}/timeline`)
				.query({ intervalMinutes: 0 })
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should accept votesAsPercentage and fromStart params and return array", async () => {
			const payload = {
				title: "TimelineFlags",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};
			const createRes = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(createRes.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			const r = await request(app.getHttpServer())
				.get(`/api/prediction/${id}/timeline`)
				.query({ intervalMinutes: 1, votesAsPercentage: true, fromStart: true })
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(r.body)).toBe(true);
		});

		it("should accept votesAsPercentage and fromStart params and return array (admin)", async () => {
			const payload = {
				title: "TimelineFlagsAdmin",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 0, B: 0 },
				status: "waiting",
			};
			const createRes = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(createRes.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			const r = await request(app.getHttpServer())
				.get(`/api/prediction/${id}/timeline`)
				.query({ intervalMinutes: 1, votesAsPercentage: true, fromStart: true })
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			expect(Array.isArray(r.body)).toBe(true);
		});
	});

	describe("CRUD /api/prediction/:id", () => {
		let predId: string;

		beforeEach(async () => {
			const payload = {
				title: "For CRUD",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { X: 0, Y: 0 },
				status: "waiting",
			};
			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			if (res.status !== HttpStatus.CREATED) {
				console.error("Create prediction failed body:", res.body, res.text);
			}
			expect(res.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			predId = all[0]._id as any;
		});

		it("should get prediction by id", async () => {
			const res = await request(app.getHttpServer())
				.get(`/api/prediction/${predId}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);
			expect(res.body._id).toBeDefined();
			expect(res.body.title).toBe("For CRUD");
		});

		it("should get prediction by id (admin)", async () => {
			const res = await request(app.getHttpServer())
				.get(`/api/prediction/${predId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			expect(res.body._id).toBeDefined();
			expect(res.body.title).toBe("For CRUD");
		});

		it("should update prediction by owner", async () => {
			const existing = await predictionService.getById(predId);
			const update = {
				title: "Updated title",
				dateFin: new Date(existing!.dateFin),
				options: existing!.options,
				status: existing!.status,
			};
			await request(app.getHttpServer())
				.put(`/api/prediction/${predId}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send(update)
				.expect(HttpStatus.OK);
			const updated = await predictionService.getById(predId);
			expect(updated!.title).toBe("Updated title");
		});

		it("should update prediction by owner (admin)", async () => {
			const existing = await predictionService.getById(predId);
			const update = {
				title: "Updated title admin",
				dateFin: existing!.dateFin,
				options: existing!.options,
				status: existing!.status,
			};
			await request(app.getHttpServer())
				.put(`/api/prediction/${predId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(update)
				.expect(HttpStatus.OK);
			const updated = await predictionService.getById(predId);
			expect(updated!.title).toBe("Updated title admin");
		});

		it("should delete prediction by owner", async () => {
			await request(app.getHttpServer())
				.delete(`/api/prediction/${predId}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.OK);
			const found = await predictionService.getById(predId);
			expect(found).toBeUndefined();
		});

		it("should delete prediction by owner (admin)", async () => {
			const payload = {
				title: "For CRUD Admin Delete",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { X: 0, Y: 0 },
				status: "waiting",
			};
			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const newId = all[0]._id as any;
			await request(app.getHttpServer())
				.delete(`/api/prediction/${newId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			const found = await predictionService.getById(newId);
			expect(found).toBeUndefined();
		});

		it("should return 404 when getting non-existent id", async () => {
			const fakeId = "000000000000000000000000";
			await request(app.getHttpServer())
				.get(`/api/prediction/${fakeId}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});

		it("should return 404 when getting non-existent id (admin)", async () => {
			const fakeId = "000000000000000000000000";
			await request(app.getHttpServer())
				.get(`/api/prediction/${fakeId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});

		it("should return 400 when deleting non-existent id", async () => {
			const fakeId = "000000000000000000000001";
			await request(app.getHttpServer())
				.delete(`/api/prediction/${fakeId}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when deleting non-existent id (admin)", async () => {
			const fakeId = "000000000000000000000001";
			await request(app.getHttpServer())
				.delete(`/api/prediction/${fakeId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when updating with a result set (cannot vote on validated)", async () => {
			const update = { result: "A" };
			await request(app.getHttpServer())
				.put(`/api/prediction/${predId}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send(update)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 400 when updating with a result set (cannot vote on validated) (admin)", async () => {
			const update = { result: "A" };
			await request(app.getHttpServer())
				.put(`/api/prediction/${predId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(update)
				.expect(HttpStatus.BAD_REQUEST);
		});
	});

	describe("PUT /api/prediction/:id/validate", () => {
		it("should validate a prediction (admin) and return structure", async () => {
			const payload = {
				title: "To Validate",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 10, B: 5 },
				status: "Valid",
			};
			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			const validateRes = await request(app.getHttpServer())
				.put(`/api/prediction/${id}/validate`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ winningOption: "A" });
			expect(validateRes.status).toBe(HttpStatus.OK);
			expect(validateRes.body).toHaveProperty("predictionId");
			expect(validateRes.body).toHaveProperty("winningOption");
			expect(validateRes.body).toHaveProperty("ratio");
			expect(validateRes.body).toHaveProperty("rewards");
		});

		it("should return 400 when winningOption is missing", async () => {
			const payload = {
				title: "To Validate Missing",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 10, B: 0 },
				status: "Valid",
			};
			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			await request(app.getHttpServer())
				.put(`/api/prediction/${id}/validate`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({})
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 403 when winningOption is missing and attempted by regular user", async () => {
			const payload = {
				title: "To Validate Missing User",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 10, B: 0 },
				status: "Valid",
			};
			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			await request(app.getHttpServer())
				.put(`/api/prediction/${id}/validate`)
				.set("Authorization", `Bearer ${userToken}`)
				.send({})
				.expect(HttpStatus.FORBIDDEN);
		});

		it("should return 400 when winningOption is invalid", async () => {
			const payload = {
				title: "To Validate InvalidOpt",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 10, B: 5 },
				status: "Valid",
			};
			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			const validateRes = await request(app.getHttpServer())
				.put(`/api/prediction/${id}/validate`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ winningOption: "Z" });
			expect(validateRes.status).toBe(HttpStatus.BAD_REQUEST);
		});

		it("should return 403 when winningOption is invalid and attempted by regular user", async () => {
			const payload = {
				title: "To Validate InvalidOpt User",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 10, B: 5 },
				status: "Valid",
			};
			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			const validateRes = await request(app.getHttpServer())
				.put(`/api/prediction/${id}/validate`)
				.set("Authorization", `Bearer ${userToken}`)
				.send({ winningOption: "Z" });
			expect(validateRes.status).toBe(HttpStatus.FORBIDDEN);
		});

		it("should return 403 when a regular user attempts to validate a prediction", async () => {
			const payload = {
				title: "UserTryValidate",
				dateFin: new Date(Date.now() + 1000 * 60 * 60),
				options: { A: 10, B: 5 },
				status: "Valid",
			};
			const res = await request(app.getHttpServer())
				.post("/api/prediction")
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload);
			expect(res.status).toBe(HttpStatus.CREATED);
			const all = await predictionService.getAll();
			const id = all[0]._id as any;

			const validateRes = await request(app.getHttpServer())
				.put(`/api/prediction/${id}/validate`)
				.set("Authorization", `Bearer ${userToken}`)
				.send({ winningOption: "A" });
			expect(validateRes.status).toBe(HttpStatus.FORBIDDEN);
		});
	});
});
