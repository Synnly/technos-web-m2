import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { CosmeticService } from "../../src/cosmetic/cosmetic.service";
import { Cosmetic, CosmeticType } from "../../src/cosmetic/cosmetic.schema";

const expectedCosmetic1 = {
    _id: "507f1f77bcf86cd799439011",
    name: "Golden Badge",
    cost: 100,
    type: CosmeticType.BADGE,
} as unknown as Cosmetic;

const expectedCosmetic2 = {
    _id: "507f1f77bcf86cd799439012",
    name: "Red Color",
    cost: 50,
    type: CosmeticType.COLOR,
    hexColor: "#FF0000",
} as unknown as Cosmetic;

const expectedCosmetics = [expectedCosmetic1, expectedCosmetic2];

// Mock Mongoose Model shape
interface MockCosmeticModel {
    new (data: any): { save: jest.Mock; [key: string]: any };
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
}

const mockCosmeticModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
})) as unknown as MockCosmeticModel;

mockCosmeticModel.find = jest.fn();
mockCosmeticModel.findById = jest.fn();
mockCosmeticModel.findByIdAndUpdate = jest.fn();
mockCosmeticModel.findByIdAndDelete = jest.fn();

describe("CosmeticService", () => {
    let cosmeticService: CosmeticService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                CosmeticService,
                { provide: getModelToken(Cosmetic.name), useValue: mockCosmeticModel },
            ],
        }).compile();

        cosmeticService = moduleRef.get(CosmeticService);
    });

    describe("findAll", () => {
        it("should return cosmetics when found", async () => {
            mockCosmeticModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(expectedCosmetics),
            });

            const result = await cosmeticService.findAll();

            expect(mockCosmeticModel.find).toHaveBeenCalled();
            expect(result).toEqual(expectedCosmetics);
        });

        it("should return empty array when none found", async () => {
            mockCosmeticModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });

            const result = await cosmeticService.findAll();

            expect(mockCosmeticModel.find).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe("findById", () => {
        it("should return a cosmetic when found", async () => {
            mockCosmeticModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(expectedCosmetic1),
            });

            const result = await cosmeticService.findById("507f1f77bcf86cd799439011");

            expect(mockCosmeticModel.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
            expect(result).toEqual(expectedCosmetic1);
        });

        it("should return null when not found", async () => {
            mockCosmeticModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await cosmeticService.findById("unknown");

            expect(mockCosmeticModel.findById).toHaveBeenCalledWith("unknown");
            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("should create and return cosmetic", async () => {
            const newCosmetic = {
                name: "Blue Color",
                cost: 80,
                type: CosmeticType.COLOR,
                hexColor: "#0000FF",
            } as unknown as Cosmetic;

            const result = await cosmeticService.create(newCosmetic);

            expect(mockCosmeticModel).toHaveBeenCalledWith(expect.objectContaining({ name: "Blue Color" }));
            expect(result).toEqual(expect.objectContaining({ name: "Blue Color" }));
        });
    });

    describe("updateById", () => {
        it("should update and return cosmetic when found", async () => {
            mockCosmeticModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ ...expectedCosmetic1, name: "Updated Badge" }),
            });

            const result = await cosmeticService.updateById("507f1f77bcf86cd799439011", { name: "Updated Badge" } as Cosmetic);

            expect(mockCosmeticModel.findByIdAndUpdate).toHaveBeenCalledWith(
                "507f1f77bcf86cd799439011",
                { name: "Updated Badge" },
                { new: true },
            );
            expect(result).toEqual(expect.objectContaining({ name: "Updated Badge" }));
        });
    });

    describe("deleteById", () => {
        it("should delete and return cosmetic when found", async () => {
            mockCosmeticModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(expectedCosmetic1),
            });

            const result = await cosmeticService.deleteById("507f1f77bcf86cd799439011");

            expect(mockCosmeticModel.findByIdAndDelete).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
            expect(result).toEqual(expectedCosmetic1);
        });

        it("should return null when cosmetic not found", async () => {
            mockCosmeticModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await cosmeticService.deleteById("unknown");

            expect(mockCosmeticModel.findByIdAndDelete).toHaveBeenCalledWith("unknown");
            expect(result).toBeNull();
        });
    });
});
