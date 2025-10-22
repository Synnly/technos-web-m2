import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe, HttpStatus } from "@nestjs/common";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseModule } from "@nestjs/mongoose";
import request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { AppModule } from "../../src/app.module";
import { UserService } from "../../src/user/user.service";
import { PredictionService } from "../../src/prediction/prediction.service";
import { VoteService } from "../../src/vote/vote.service";
import { CosmeticService } from "../../src/cosmetic/cosmetic.service";
import { CosmeticType } from "../../src/cosmetic/cosmetic.schema";

describe("Vote integration tests", () => {
	let app: INestApplication;
	let mongoServer: MongoMemoryServer;
	let userService: UserService;
	let predictionService: PredictionService;
	let voteService: VoteService;
	let cosmeticService: CosmeticService;
	let userToken: string;
	let testUser: any;
	let adminToken: string;
	let testAdmin: any;
	let testPrediction: any;

	const userData = { username: "voter", motDePasse: "VotePass123!", points: 1000 };
	const predictionData = {
		title: "Will X happen?",
		description: "desc",
		options: { yes: 0, no: 0 },
	};

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const uri = mongoServer.getUri();

		const moduleRef: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [() => ({ DATABASE_URL: uri, NODE_ENV: "test" })],
				}),
				MongooseModule.forRoot(uri),
				AppModule,
			],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
		await app.init();

		userService = moduleRef.get(UserService);
		predictionService = moduleRef.get(PredictionService);
		voteService = moduleRef.get(VoteService);
		cosmeticService = moduleRef.get(CosmeticService);
	});

	beforeEach(async () => {
		await userService.createUser(userData);
		testUser = await userService.getByUsername(userData.username);
		const login = await request(app.getHttpServer())
			.post("/api/user/login")
			.send({ username: userData.username, password: userData.motDePasse });
		userToken = login.body.token.token;

		// create an admin user and token
		const adminData = { username: "voteradmin", motDePasse: "AdminVotePass123!", points: 10000 };
		await userService.createUser(adminData);
		await userService.setAdmin(adminData.username);
		testAdmin = await userService.getByUsername(adminData.username);
		const adminLogin = await request(app.getHttpServer())
			.post("/api/user/login")
			.send({ username: adminData.username, password: adminData.motDePasse });
		adminToken = adminLogin.body.token.token;

		const predPayload = {
			...predictionData,
			dateFin: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
			user_id: (testUser as any)._id || (testUser as any).id,
		};
		await predictionService.createPrediction(predPayload as any);
		testPrediction = (await predictionService.getAll())[0];
	});

	afterEach(async () => {
		if (testUser) await userService.deleteById((testUser as any).id || (testUser as any)._id);
		if (testAdmin) await userService.deleteById((testAdmin as any).id || (testAdmin as any)._id);
		const preds = await predictionService.getAll();
		for (const p of preds) {
			await predictionService.deleteById((p as any)._id || (p as any).id);
		}
		const votes = await voteService.getAll();
		for (const v of votes) {
			await voteService.deleteVote((v as any)._id || (v as any).id);
		}
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	it("should create a vote successfully", async () => {
		const payload = {
			amount: 10,
			prediction_id: (testPrediction as any)._id || (testPrediction as any).id,
			option: "yes",
			date: new Date().toISOString(),
			user_id: (testUser as any)._id || (testUser as any).id,
		};

		await request(app.getHttpServer())
			.post("/api/vote")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		const votes = await voteService.getAll();
		expect(votes.length).toBe(1);
		expect(votes[0].amount).toBe(10);
	});

	it("should reject vote with insufficient amount", async () => {
		const payload = {
			amount: 0,
			prediction_id: (testPrediction as any)._id || (testPrediction as any).id,
			option: "yes",
			date: new Date().toISOString(),
			user_id: (testUser as any)._id || (testUser as any).id,
		};

		await request(app.getHttpServer())
			.post("/api/vote")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should fail without auth", async () => {
		const payload = {
			amount: 10,
			prediction_id: (testPrediction as any)._id || (testPrediction as any).id,
			option: "yes",
			date: new Date().toISOString(),
			user_id: (testUser as any)._id || (testUser as any).id,
		};

		await request(app.getHttpServer()).post("/api/vote").send(payload).expect(HttpStatus.UNAUTHORIZED);
	});

	it("should create a vote successfully as admin", async () => {
		const payload = {
			amount: 5,
			prediction_id: (testPrediction as any)._id || (testPrediction as any).id,
			option: "yes",
			date: new Date().toISOString(),
			user_id: (testAdmin as any)._id || (testAdmin as any).id,
		};

		await request(app.getHttpServer())
			.post("/api/vote")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		const votes = await voteService.getAll();
		expect(votes.length).toBeGreaterThanOrEqual(1);
		expect(votes.some((v) => v.amount === 5)).toBe(true);
	});

	it("should return votes to authenticated user and admin via GET", async () => {
		const payload = {
			amount: 7,
			prediction_id: (testPrediction as any)._id || (testPrediction as any).id,
			option: "yes",
			date: new Date().toISOString(),
			user_id: (testUser as any)._id || (testUser as any).id,
		};
		await request(app.getHttpServer())
			.post("/api/vote")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		const resUser = await request(app.getHttpServer())
			.get("/api/vote")
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.OK);
		expect(Array.isArray(resUser.body)).toBe(true);
		expect(resUser.body.length).toBeGreaterThanOrEqual(1);

		const resAdmin = await request(app.getHttpServer())
			.get("/api/vote")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(HttpStatus.OK);
		expect(Array.isArray(resAdmin.body)).toBe(true);
		expect(resAdmin.body.length).toBeGreaterThanOrEqual(1);
	});

	it("should get, update and delete a vote by id (owner and admin)", async () => {
		const payload = {
			amount: 12,
			prediction_id: (testPrediction as any)._id || (testPrediction as any).id,
			option: "yes",
			date: new Date().toISOString(),
			user_id: (testUser as any)._id || (testUser as any).id,
		};
		await request(app.getHttpServer())
			.post("/api/vote")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		const votes = await voteService.getAll();
		expect(votes.length).toBeGreaterThanOrEqual(1);
		const created = votes[0];

		await request(app.getHttpServer())
			.get(`/api/vote/${(created as any)._id || (created as any).id}`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.OK);

		const updatePayload = {
			amount: 20,
			user_id: (created as any).user_id || (created as any).user_id,
			prediction_id: (created as any).prediction_id || (created as any).prediction_id,
		};
		const putRes = await request(app.getHttpServer())
			.put(`/api/vote/${(created as any)._id || (created as any).id}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(updatePayload);
		expect(putRes.status).toBe(HttpStatus.OK);

		const afterUpdate = await voteService.getById((created as any)._id || (created as any).id);
		expect(afterUpdate).toBeDefined();
		expect((afterUpdate as any).amount).toBe(20);

		const after = await voteService.getById((created as any)._id || (created as any).id);

		const delRes = await request(app.getHttpServer())
			.delete(`/api/vote/${(created as any)._id || (created as any).id}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect([HttpStatus.OK, HttpStatus.NOT_FOUND]).toContain(delRes.status);

		const remaining = await voteService.getAll();
		expect(remaining.length).toBe(0);
	});

	it("should return 400 when creating a vote with non-existent prediction", async () => {
		const payload = {
			amount: 5,
			prediction_id: "000000000000000000000000",
			option: "yes",
			date: new Date().toISOString(),
			user_id: (testUser as any)._id || (testUser as any).id,
		};

		await request(app.getHttpServer())
			.post("/api/vote")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should return 400 when creating a vote with non-existent user", async () => {
		const payload = {
			amount: 5,
			prediction_id: (testPrediction as any)._id || (testPrediction as any).id,
			option: "yes",
			date: new Date().toISOString(),
			user_id: "000000000000000000000000",
		};

		await request(app.getHttpServer())
			.post("/api/vote")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.BAD_REQUEST);
	});
});
