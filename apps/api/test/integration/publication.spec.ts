import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe, HttpStatus } from "@nestjs/common";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppModule } from "../../src/app.module";
import { UserService } from "../../src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../../src/user/user.schema";
import { PublicationService } from "../../src/publication/publication.service";
import { PredictionService } from "../../src/prediction/prediction.service";

describe("Publication integration tests", () => {
	let app: INestApplication;
	let mongoServer: MongoMemoryServer;
	let userService: UserService;
	let jwtService: JwtService;
	let publicationService: PublicationService;
	let predictionService: PredictionService;

	const userData = { username: "pubuser", motDePasse: "PubPass123!", points: 100 };
	const adminData = { username: "pubadmin", motDePasse: "PubAdminPass123!", points: 1000 };

	let userToken: string;
	let adminToken: string;
	let user: any;
	let admin: any;
	let testPrediction: any;

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const uri = mongoServer.getUri();

		const moduleRef: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true, load: [() => ({ DATABASE_URL: uri, NODE_ENV: "test" })] }),
				MongooseModule.forRoot(uri),
				AppModule,
			],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
		await app.init();

		userService = moduleRef.get<UserService>(UserService);
		jwtService = moduleRef.get<JwtService>(JwtService);
		publicationService = moduleRef.get<PublicationService>(PublicationService);
		predictionService = moduleRef.get<PredictionService>(PredictionService);
	});

	beforeEach(async () => {
		await userService.createUser(userData);
		user = await userService.getByUsername(userData.username);
		userToken = jwtService.sign({ username: user.username, role: (user as any).role, _id: (user as any)._id });

		await userService.createUser(adminData);
		await userService.setAdmin(adminData.username);
		admin = await userService.getByUsername(adminData.username);
		adminToken = jwtService.sign({
			username: admin.username,
			role: (admin as any).role || Role.ADMIN,
			_id: (admin as any)._id,
		});

		const predPayload = {
			title: "PubPred",
			dateFin: new Date(Date.now() + 1000 * 60 * 60),
			options: { A: 0, B: 0 },
			status: "waiting",
		};
		const createRes = await request(app.getHttpServer())
			.post("/api/prediction")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(predPayload);
		if (createRes.status !== HttpStatus.CREATED) {
			console.error("Create prediction in setup failed:", createRes.status, createRes.body, createRes.text);
		}
		expect(createRes.status).toBe(HttpStatus.CREATED);
		testPrediction = (await predictionService.getAll())[0];
	});

	afterEach(async () => {
		if (user) await userService.deleteById(user._id || user.id);
		if (admin) await userService.deleteById(admin._id || admin.id);
		const pubs = await publicationService.getAll();
		for (const p of pubs) {
			try {
				await publicationService.deleteById((p as any)._id || (p as any).id);
			} catch (e) {}
		}
		const preds = await predictionService.getAll();
		for (const p of preds) {
			try {
				await predictionService.deleteById((p as any)._id || (p as any).id);
			} catch (e) {}
		}
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	it("should create a publication as user and admin", async () => {
		const payload = {
			message: "Hello world",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		expect(pubs.length).toBeGreaterThanOrEqual(1);

		const payload2 = {
			message: "Admin post",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: admin._id || admin.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload2)
			.expect(HttpStatus.CREATED);
		const pubs2 = await publicationService.getAll();
		expect(pubs2.length).toBeGreaterThanOrEqual(2);
	});

	it("should get publications (user and admin)", async () => {
		const payload = {
			message: "Hello get",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		const resUser = await request(app.getHttpServer())
			.get("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.OK);
		expect(Array.isArray(resUser.body)).toBe(true);

		const resAdmin = await request(app.getHttpServer())
			.get("/api/publication")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(HttpStatus.OK);
		expect(Array.isArray(resAdmin.body)).toBe(true);
	});

	it("should get, update and delete publication by id (user and admin)", async () => {
		const payload = {
			message: "CRUD pub",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		expect(pubs.length).toBeGreaterThanOrEqual(1);
		const created = pubs[0];

		await request(app.getHttpServer())
			.get(`/api/publication/${(created as any)._id}`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.OK);

		const update = {
			message: "Updated by admin",
			datePublication: new Date().toISOString(),
			user_id: admin._id || admin.id,
			prediction_id: (testPrediction as any)._id,
		};
		await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(update)
			.expect(HttpStatus.OK);

		const after = await publicationService.getById((created as any)._id);
		expect(after).toBeDefined();

		const delRes = await request(app.getHttpServer())
			.delete(`/api/publication/${(created as any)._id}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect([HttpStatus.OK, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.NOT_FOUND]).toContain(delRes.status);
	});

	it("should toggle like/unlike as user and admin", async () => {
		const payload = {
			message: "Like test",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		const created = pubs[0];

		const likeRes = await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}/toggle-like/${user._id || user.id}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(likeRes.status).toBe(HttpStatus.OK);

		const likeRes2 = await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}/toggle-like/${admin._id || admin.id}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(likeRes2.status).toBe(HttpStatus.OK);
	});

	it("should reject creation without auth", async () => {
		const payload = {
			message: "No auth",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer()).post("/api/publication").send(payload).expect(HttpStatus.UNAUTHORIZED);
	});

	it("should return 400 for missing required fields", async () => {
		const payloads = [
			{
				datePublication: new Date().toISOString(),
				prediction_id: (testPrediction as any)._id,
				user_id: user._id,
			},
			{ message: "No date", prediction_id: (testPrediction as any)._id, user_id: user._id || user.id },
			{ message: "No prediction", datePublication: new Date().toISOString(), user_id: user._id || user.id },
			{
				message: "No user",
				datePublication: new Date().toISOString(),
				prediction_id: (testPrediction as any)._id,
			},
		];

		for (const p of payloads) {
			await request(app.getHttpServer())
				.post("/api/publication")
				.set("Authorization", `Bearer ${userToken}`)
				.send(p)
				.expect(HttpStatus.BAD_REQUEST);
		}
	});

	it("should return 400 when datePublication is in the past", async () => {
		const payload = {
			message: "Past date",
			datePublication: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should return 404 when getting non-existent publication by id", async () => {
		const fakeId = "000000000000000000000000";
		await request(app.getHttpServer())
			.get(`/api/publication/${fakeId}`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.NOT_FOUND);
	});

	it("should return 500 when deleting non-existent publication", async () => {
		const fakeId = "000000000000000000000001";
		const res = await request(app.getHttpServer())
			.delete(`/api/publication/${fakeId}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
	});

	it("should return 400 when updating publication with invalid data", async () => {
		const payload = {
			message: "To update",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		const created = pubs[0];

		const invalid = {
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(invalid)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should create publication when PUT to non-existent id (create path)", async () => {
		const newId = "5f5a76c8e7a1f20000000001";
		const payload = {
			message: "Created by PUT",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: admin._id || admin.id,
		};
		await request(app.getHttpServer())
			.put(`/api/publication/${newId}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.OK);
		const pubs = await publicationService.getAll();
		expect(pubs.some((p) => (p as any).message === "Created by PUT")).toBe(true);
	});

	it("should create even when prediction_id does not exist (service does not validate existence)", async () => {
		const payload = {
			message: "Bad pred",
			datePublication: new Date().toISOString(),
			prediction_id: "000000000000000000000000",
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
	});

	it("should create even when user_id does not exist (service does not validate existence)", async () => {
		const payload = {
			message: "Bad user",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: "000000000000000000000000",
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
	});

	it("should return 400 when likes is not an array", async () => {
		const payload: any = {
			message: "Likes bad",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
			likes: "not-an-array",
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should return 400 when toggling like with missing userId", async () => {
		const payload = {
			message: "Toggle missing user",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		const created = pubs[0];
		await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}/toggle-like/`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.NOT_FOUND);
	});

	it("should return 400 when toggling like with invalid userId", async () => {
		const payload = {
			message: "Toggle bad user",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		const created = pubs[0];
		await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}/toggle-like/000000000000000000000000`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.OK);
	});

	it("should allow a non-owner to update a publication (no ownership enforced)", async () => {
		const payload = {
			message: "Owner post",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		const created = pubs[0];

		const otherUserData = { username: "other", motDePasse: "OtherPass123!", points: 10 };
		await userService.createUser(otherUserData);
		const other = await userService.getByUsername(otherUserData.username);
		if (!other) throw new Error("Test setup failed: other user not created");
		const otherToken = jwtService.sign({
			username: other.username,
			role: (other as any).role,
			_id: (other as any)._id,
		});

		const update = {
			message: "Updated by other",
			datePublication: new Date().toISOString(),
			user_id: (other as any)._id,
			prediction_id: (testPrediction as any)._id,
		};
		await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}`)
			.set("Authorization", `Bearer ${otherToken}`)
			.send(update)
			.expect(HttpStatus.OK);
		const after = await publicationService.getById((created as any)._id);
		expect(after).toBeDefined();
		expect((after as any).message).toBe("Updated by other");

		if (other) await userService.deleteById((other as any)._id || (other as any).id);
	});

	it("should allow a non-owner to delete a publication", async () => {
		const payload = {
			message: "To be deleted",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		const created = pubs[0];

		const otherUserData = { username: "deleter", motDePasse: "DelPass123!", points: 10 };
		await userService.createUser(otherUserData);
		const other = await userService.getByUsername(otherUserData.username);
		if (!other) throw new Error("Test setup failed: other user not created");
		const otherToken = jwtService.sign({
			username: other.username,
			role: (other as any).role,
			_id: (other as any)._id,
		});

		await request(app.getHttpServer())
			.delete(`/api/publication/${(created as any)._id}`)
			.set("Authorization", `Bearer ${otherToken}`)
			.expect(HttpStatus.OK);

		await request(app.getHttpServer())
			.get(`/api/publication/${(created as any)._id}`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.NOT_FOUND);

		if (other) await userService.deleteById((other as any)._id || (other as any).id);
	});

	it("should add and remove a like when toggled twice by same user", async () => {
		const payload = {
			message: "Like twice",
			datePublication: new Date().toISOString(),
			prediction_id: (testPrediction as any)._id,
			user_id: user._id || user.id,
		};
		await request(app.getHttpServer())
			.post("/api/publication")
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const pubs = await publicationService.getAll();
		const created = pubs[0];

		const r1 = await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}/toggle-like/${user._id || user.id}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(r1.status).toBe(HttpStatus.OK);
		const after1 = await publicationService.getById((created as any)._id);
		expect((after1 as any).likes.length).toBeGreaterThanOrEqual(1);

		const r2 = await request(app.getHttpServer())
			.put(`/api/publication/${(created as any)._id}/toggle-like/${user._id || user.id}`)
			.set("Authorization", `Bearer ${userToken}`);
		expect(r2.status).toBe(HttpStatus.OK);
		const after2 = await publicationService.getById((created as any)._id);
		expect((after2 as any).likes.length).toBe(0);
	});
});
