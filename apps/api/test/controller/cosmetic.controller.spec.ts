import { Test } from "@nestjs/testing";
import { CosmeticController } from "../../src/cosmetic/cosmetic.controller";
import { CosmeticService } from "../../src/cosmetic/cosmetic.service";
import { Cosmetic, CosmeticType } from "../../src/cosmetic/cosmetic.schema";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Role } from "../../src/user/user.schema";

const expectedCosmetic1: Cosmetic = {
	_id: "c1",
	name: "Golden Badge",
	cost: 100,
	type: CosmeticType.BADGE,
	owned: false,
};

const expectedCosmetic2: Cosmetic = {
	_id: "c2",
	name: "Red Pseudo",
	cost: 200,
	type: CosmeticType.COLOR,
	hexColor: "#FF0000",
	owned: false,
};

const expectedCosmetics = [expectedCosmetic1, expectedCosmetic2];

const mockCosmeticService = {
	findAll: jest.fn(),
	findById: jest.fn(),
	create: jest.fn(),
	updateById: jest.fn(),
	deleteById: jest.fn(),
};

describe("CosmeticController", () => {
	let cosmeticController: CosmeticController;
	let cosmeticService: CosmeticService;

	beforeEach(async () => {
		jest.clearAllMocks();
		const moduleRef = await Test.createTestingModule({
			controllers: [CosmeticController],
			providers: [
				{
					provide: CosmeticService,
					useValue: mockCosmeticService,
				},
			],
		}).compile();

		cosmeticController = moduleRef.get(CosmeticController);
		cosmeticService = moduleRef.get(CosmeticService);
	});

	describe("getCosmetics", () => {
		it("should return all cosmetics", async () => {
			mockCosmeticService.findAll.mockResolvedValue(expectedCosmetics);

			const result = await cosmeticController.getCosmetics();
			expect(result).toEqual(expectedCosmetics);
			expect(cosmeticService.findAll).toHaveBeenCalled();
		});

		it("should return empty array when no cosmetics", async () => {
			mockCosmeticService.findAll.mockResolvedValue([]);

			const result = await cosmeticController.getCosmetics();
			expect(result).toEqual([]);
			expect(cosmeticService.findAll).toHaveBeenCalled();
		});
	});

	describe("getCosmeticById", () => {
		it("should return cosmetic when found", async () => {
			mockCosmeticService.findById.mockResolvedValue(expectedCosmetic1);

			const result = await cosmeticController.getCosmeticById("c1");
			expect(result).toEqual(expectedCosmetic1);
			expect(cosmeticService.findById).toHaveBeenCalledWith("c1");
		});

		it("should throw 400 if id is missing", async () => {
			await expect(
				cosmeticController.getCosmeticById(""),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw 404 if cosmetic not found", async () => {
			mockCosmeticService.findById.mockResolvedValue(null);

			await expect(
				cosmeticController.getCosmeticById("unknown"),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("createCosmetic", () => {
		const adminUser = { username: "admin", role: Role.ADMIN };
		const normalUser = { username: "user", role: Role.USER };

		it("should create cosmetic when admin", async () => {
			mockCosmeticService.create.mockResolvedValue(expectedCosmetic1);

			const result = await cosmeticController.createCosmetic(
				expectedCosmetic1,
				adminUser,
				"admin",
			);

			expect(result).toEqual(expectedCosmetic1);
			expect(cosmeticService.create).toHaveBeenCalledWith(
				expectedCosmetic1,
			);
		});

		it("should throw 400 if not admin", async () => {
			await expect(
				cosmeticController.createCosmetic(
					expectedCosmetic1,
					normalUser,
					"user",
				),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw 400 if body missing", async () => {
			await expect(
				cosmeticController.createCosmetic(
					undefined,
					adminUser,
					"admin",
				),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw 400 if name missing", async () => {
			const badCosmetic = {
				...expectedCosmetic1,
				name: undefined,
			} as any;
			await expect(
				cosmeticController.createCosmetic(
					badCosmetic,
					adminUser,
					"admin",
				),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw 400 if cost missing", async () => {
			const badCosmetic = {
				...expectedCosmetic1,
				cost: undefined,
			} as any;
			await expect(
				cosmeticController.createCosmetic(
					badCosmetic,
					adminUser,
					"admin",
				),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw 400 if type missing", async () => {
			const badCosmetic = {
				...expectedCosmetic1,
				type: undefined,
			} as any;
			await expect(
				cosmeticController.createCosmetic(
					badCosmetic,
					adminUser,
					"admin",
				),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe("updateCosmetic", () => {
		const adminUser = { username: "admin", role: Role.ADMIN };
		const normalUser = { username: "user", role: Role.USER };

		it("should update cosmetic when admin and exists", async () => {
			mockCosmeticService.findById.mockResolvedValue(expectedCosmetic1);
			mockCosmeticService.updateById.mockResolvedValue(expectedCosmetic1);

			const result = await cosmeticController.updateCosmetic(
				"c1",
				expectedCosmetic1,
				adminUser,
				"admin",
			);

			expect(result).toEqual(expectedCosmetic1);
			expect(cosmeticService.updateById).toHaveBeenCalledWith(
				"c1",
				expectedCosmetic1,
			);
		});

		it("should throw 400 if not admin", async () => {
			await expect(
				cosmeticController.updateCosmetic(
					"c1",
					expectedCosmetic1,
					normalUser,
					"user",
				),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw 400 if body missing", async () => {
			await expect(
				cosmeticController.updateCosmetic(
					"c1",
					undefined,
					adminUser,
					"admin",
				),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw 404 if cosmetic not found", async () => {
			mockCosmeticService.findById.mockResolvedValue(null);
			await expect(
				cosmeticController.updateCosmetic(
					"c1",
					expectedCosmetic1,
					adminUser,
					"admin",
				),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe("deleteCosmetic", () => {
		const adminUser = { username: "admin", role: Role.ADMIN };
		const normalUser = { username: "user", role: Role.USER };

		it("should delete cosmetic when admin", async () => {
			mockCosmeticService.findById.mockResolvedValue(expectedCosmetic1);
			mockCosmeticService.deleteById.mockResolvedValue(expectedCosmetic1);

			const result = await cosmeticController.deleteCosmetic(
				"c1",
				adminUser,
				"admin",
			);
			expect(result).toEqual(expectedCosmetic1);
			expect(cosmeticService.deleteById).toHaveBeenCalledWith("c1");
		});

		it("should throw 400 if not admin", async () => {
			await expect(
				cosmeticController.deleteCosmetic("c1", normalUser, "user"),
			).rejects.toThrow(BadRequestException);
		});

		it("should throw 404 if cosmetic not found", async () => {
			mockCosmeticService.findById.mockResolvedValue(null);
			await expect(
				cosmeticController.deleteCosmetic("c1", adminUser, "admin"),
			).rejects.toThrow(NotFoundException);
		});

		it("should throw 400 if service throws error", async () => {
			mockCosmeticService.findById.mockResolvedValue(expectedCosmetic1);
			mockCosmeticService.deleteById.mockRejectedValue(
				new Error("Delete failed"),
			);

			await expect(
				cosmeticController.deleteCosmetic("c1", adminUser, "admin"),
			).rejects.toThrow(BadRequestException);
		});
	});
});