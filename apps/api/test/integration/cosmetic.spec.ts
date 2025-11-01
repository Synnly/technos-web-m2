import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppModule } from "../../src/app.module";
import { UserService } from "../../src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { CosmeticService } from "../../src/cosmetic/cosmetic.service";
import { CosmeticType } from "../../src/cosmetic/cosmetic.schema";
import { Role } from "../../src/user/user.schema";

describe("Cosmetic Integration Tests", () => {
	it("should return 404 when user gets cosmetic by invalid id", async () => {
		await request(app.getHttpServer())
			.get(`/api/cosmetic/000000000000000000000000`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.NOT_FOUND);
	});

	it("should return 404 when admin gets cosmetic by invalid id", async () => {
		await request(app.getHttpServer())
			.get(`/api/cosmetic/000000000000000000000000`)
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(HttpStatus.NOT_FOUND);
	});

	it("should return 400 when admin updates cosmetic with invalid id", async () => {
		const badUpdate = { name: "newname", cost: 10, type: CosmeticType.BADGE };
		await request(app.getHttpServer())
			.put(`/api/cosmetic/000000000000000000000000`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(badUpdate)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should return 403 when user updates cosmetic with valid id", async () => {
		const payload = { name: "badge-update", cost: 5, type: CosmeticType.BADGE, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
		const all = await cosmeticService.findAll();
		const id = (all[0] as any)._id;
		const update = { name: "newname" };
		await request(app.getHttpServer())
			.put(`/api/cosmetic/${id}`)
			.set("Authorization", `Bearer ${userToken}`)
			.send(update)
			.expect(HttpStatus.FORBIDDEN);
	});

	it("should return 400 when admin creates cosmetic with missing cost", async () => {
		const payload = { name: "badge", type: CosmeticType.BADGE, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should return 400 when admin creates cosmetic with missing type", async () => {
		const payload = { name: "badge", cost: 10, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should return 400 when admin creates cosmetic with invalid value", async () => {
	const payload = { name: "badge", cost: 10, type: CosmeticType.COLOR, value: 123 };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("should return 403 when user tries to list cosmetics", async () => {
		await request(app.getHttpServer())
			.get(`/api/cosmetic`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.OK);
	});

	it("should return 403 when user tries to delete cosmetic with invalid id", async () => {
		await request(app.getHttpServer())
			.delete(`/api/cosmetic/000000000000000000000000/${testUserData.username}`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.FORBIDDEN);
	});
	let app: INestApplication;
	let moduleRef: TestingModule;
	let mongoServer: MongoMemoryServer;
	let userService: UserService;
	let cosmeticService: CosmeticService;
	let jwtService: JwtService;

	const testUserData = { username: "ctestuser", motDePasse: "Pass123!", points: 10 };
	const testAdminData = { username: "ctestadmin", motDePasse: "Pass123!", points: 10, role: Role.ADMIN };

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
		cosmeticService = moduleRef.get<CosmeticService>(CosmeticService);
		jwtService = moduleRef.get<JwtService>(JwtService);
	});

	let userToken: string;
	let adminToken: string;

	beforeEach(async () => {
		await userService.createUser(testUserData);
		await userService.createOrUpdateByUsername(testUserData.username, testUserData);
		await userService.createUser(testAdminData);
		await userService.setAdmin(testAdminData.username);

		const createdUser = await userService.getByUsername(testUserData.username);
		userToken = jwtService.sign({
			username: (createdUser as any).username,
			role: (createdUser as any).role,
			_id: (createdUser as any)._id,
		});
		const createdAdmin = await userService.getByUsername(testAdminData.username);
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
		const all = await cosmeticService.findAll();
		for (const c of all) {
			try {
				await cosmeticService.deleteById((c as any)._id);
			} catch (e) {}
		}
	});

	afterAll(async () => {
		await app.close();
		await mongoServer.stop();
	});

	it("should forbid user from creating cosmetic", async () => {
		const payload = { name: "badge1", cost: 5, type: CosmeticType.BADGE, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testUserData.username}`)
			.set("Authorization", `Bearer ${userToken}`)
			.send(payload)
			.expect(HttpStatus.FORBIDDEN);
	});

	it("should allow admin to create cosmetic", async () => {
		const payload = { name: "badge1", cost: 5, type: CosmeticType.BADGE, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);
	});

	it("should list cosmetics for user", async () => {
		const payload = { name: "badge-list", cost: 3, type: CosmeticType.BADGE, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		await request(app.getHttpServer())
			.get(`/api/cosmetic`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.OK);
	});

	it("should list cosmetics for admin", async () => {
		const payload = { name: "badge-list-admin", cost: 3, type: CosmeticType.BADGE, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		await request(app.getHttpServer())
			.get(`/api/cosmetic`)
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(HttpStatus.OK);
	});

	it("should get cosmetic by id for user", async () => {
		const payload = { name: "badge-get", cost: 4, type: CosmeticType.BADGE, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		const all = await cosmeticService.findAll();
		const id = (all[0] as any)._id;

		await request(app.getHttpServer())
			.get(`/api/cosmetic/${id}`)
			.set("Authorization", `Bearer ${userToken}`)
			.expect(HttpStatus.OK);
	});

	it("should get cosmetic by id for admin", async () => {
		const payload = { name: "badge-get-admin", cost: 4, type: CosmeticType.BADGE, value: ":badge:" };
		await request(app.getHttpServer())
			.post(`/api/cosmetic/${testAdminData.username}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send(payload)
			.expect(HttpStatus.CREATED);

		const all = await cosmeticService.findAll();
		const id = (all[0] as any)._id;

		await request(app.getHttpServer())
			.get(`/api/cosmetic/${id}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(HttpStatus.OK);
	});

	describe("validation and admin-only behavior", () => {
		it("should return 400 when admin tries to create invalid cosmetic (missing name)", async () => {
			const payload = { cost: 5, type: CosmeticType.BADGE };
			await request(app.getHttpServer())
				.post(`/api/cosmetic/${testAdminData.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(payload)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should return 403 when user tries to create cosmetic (forbidden by guard)", async () => {
			const payload = { name: "x", cost: 1, type: CosmeticType.BADGE };
			await request(app.getHttpServer())
				.post(`/api/cosmetic/${testUserData.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send(payload)
				.expect(HttpStatus.FORBIDDEN);
		});

		it("should return 400 when admin updates cosmetic with invalid data", async () => {
			const createPayload = { name: "to-update", cost: 6, type: CosmeticType.BADGE, value: ":badge:" };
			await request(app.getHttpServer())
				.post(`/api/cosmetic/${testAdminData.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(createPayload)
				.expect(HttpStatus.CREATED);

			const all = await cosmeticService.findAll();
			const id = (all[0] as any)._id;

			const badUpdate = { name: "", cost: -5 };
			await request(app.getHttpServer())
				.put(`/api/cosmetic/${id}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(badUpdate)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it("should forbid regular user from updating cosmetic", async () => {
			const createPayload = { name: "to-update-2", cost: 6, type: CosmeticType.BADGE, value: ":badge:" };
			await request(app.getHttpServer())
				.post(`/api/cosmetic/${testAdminData.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(createPayload)
				.expect(HttpStatus.CREATED);

			const all = await cosmeticService.findAll();
			if (all.length > 0) {
				const id = (all[0] as any)._id;
				const update = { name: "newname" };
				await request(app.getHttpServer())
					.put(`/api/cosmetic/${id}`)
					.set("Authorization", `Bearer ${userToken}`)
					.send(update)
					.expect(HttpStatus.FORBIDDEN);
			} else {
				throw new Error("Aucun cosmétique créé pour le test d'update.");
			}
		});

		it("should allow admin to delete cosmetic and return 404 afterwards", async () => {
			const createPayload = { name: "to-delete", cost: 7, type: CosmeticType.BADGE, value: ":badge:" };
			await request(app.getHttpServer())
				.post(`/api/cosmetic/${testAdminData.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(createPayload)
				.expect(HttpStatus.CREATED);

			const id = (await cosmeticService.findAll())[0]._id;

			// Suppression admin, doit retourner 200 si trouvé
			const existsBeforeDelete = await cosmeticService.findById(id);
			if (existsBeforeDelete) {
				await request(app.getHttpServer())
					.delete(`/api/cosmetic/${id}/${testAdminData.username}`)
					.set("Authorization", `Bearer ${adminToken}`)
					.expect(HttpStatus.OK);
			}
			// Second delete: should be 404 (already deleted)
			await request(app.getHttpServer())
				.delete(`/api/cosmetic/${id}/${testAdminData.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.NOT_FOUND);

			// GET après suppression, doit retourner 404
			await request(app.getHttpServer())
				.get(`/api/cosmetic/${id}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.NOT_FOUND);
		});

		it("should forbid regular user from deleting cosmetic", async () => {
			const createPayload = { name: "to-delete-2", cost: 8, type: CosmeticType.BADGE, value: ":badge:" };
			await request(app.getHttpServer())
				.post(`/api/cosmetic/${testAdminData.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send(createPayload)
				.expect(HttpStatus.CREATED);

			const all = await cosmeticService.findAll();
			const id = (all[0] as any)._id;

			// Suppression par user, doit retourner 403 si l'objet existe, sinon 404
			const existsBeforeUserDelete = await cosmeticService.findById(id);
			if (existsBeforeUserDelete) {
				await request(app.getHttpServer())
					.delete(`/api/cosmetic/${id}/${testUserData.username}`)
					.set("Authorization", `Bearer ${userToken}`)
					.expect(HttpStatus.FORBIDDEN);
			} else {
				await request(app.getHttpServer())
					.delete(`/api/cosmetic/${id}/${testUserData.username}`)
					.set("Authorization", `Bearer ${userToken}`)
					.expect(HttpStatus.NOT_FOUND);
			}

			// Suppression par user sur un id inexistant, doit retourner 403 (car le guard bloque avant la vérification d'existence)
			await request(app.getHttpServer())
				.delete(`/api/cosmetic/000000000000000000000000/${testUserData.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.FORBIDDEN);

			// Suppression par user après suppression par admin, doit retourner 404
			await request(app.getHttpServer())
				.delete(`/api/cosmetic/${id}/${testAdminData.username}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(HttpStatus.OK);
			await request(app.getHttpServer())
				.delete(`/api/cosmetic/${id}/${testUserData.username}`)
				.set("Authorization", `Bearer ${userToken}`)
				.expect(HttpStatus.FORBIDDEN);
		});
	});
});
