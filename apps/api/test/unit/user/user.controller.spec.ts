import { UserController } from "../../../src/user/user.controller";
import { UserService } from "../../../src/user/user.service";
import { Test } from "@nestjs/testing";
import { Role, User } from "../../../src/user/user.schema";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { CosmeticService } from "../../../src/cosmetic/cosmetic.service";
import { getModelToken } from "@nestjs/mongoose";
import { CosmeticType } from "../../../src/cosmetic/cosmetic.schema";
import { Model } from "mongoose";
import { UserDto } from "../../../src/user/dto/user.dto";

const expectedUser1 = {
	_id: "1",
	username: "testuser1",
	motDePasse: "H@sh3dpassword",
	points: 50,
	dateDerniereRecompenseQuotidienne: null,
	predictions: [],
	votes: [],
	role: "user",
	cosmeticsOwned: [],
	currentCosmetic: [],
} as User;

const expectedUser2 = {
	_id: "2",
	username: "testuser2",
	motDePasse: "H@sh3dpassword2",
	points: 100,
	dateDerniereRecompenseQuotidienne: new Date(),
	predictions: [],
	votes: [],
	role: "user",
	cosmeticsOwned: [],
	currentCosmetic: [],
} as User;

const mockUserService = {
	getAll: jest.fn(),
	getByUsername: jest.fn(),
	createUser: jest.fn(),
	createOrUpdateByUsername: jest.fn(),
	deleteByUsername: jest.fn(),
	getJwtToken: jest.fn(),
	claimDailyReward: jest.fn(),
	buyCosmetic: jest.fn(),
};

// Mock du JwtService
const mockJwtService = {
	sign: jest.fn().mockReturnValue("mock-jwt-token"),
	verify: jest.fn(),
};

const mockCosmeticService = {
	findAll: jest.fn(),
	findById: jest.fn(),
	create: jest.fn(),
	updateById: jest.fn(),
	deleteById: jest.fn(),
};

interface MockCosmeticModel {
	new (data: any): { save: jest.Mock; [key: string]: any };
	find: jest.Mock;
	findById: jest.Mock;
	findByIdAndUpdate: jest.Mock;
	findByIdAndDelete: jest.Mock;
	findOne: jest.Mock;
}

const mockCosmeticModel = jest.fn().mockImplementation((data) => ({
	...data,
	save: jest.fn().mockResolvedValue({
		_id: "3",
		...data,
		owned: false,
	}),
})) as unknown as MockCosmeticModel;

const mockRequest = {
    user: expectedUser1,
};

const mockUserModel = {
	findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) }),
	findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) }),
	find: jest.fn().mockReturnValue({
		exec: jest.fn().mockResolvedValue([expectedUser1, expectedUser2]),
	}),
	findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) }),
	create: jest.fn().mockResolvedValue(expectedUser1),
} as any;

describe("UserController", () => {
	let userService: UserService;
	let userController: UserController;

	// Initialiser le module de test avant chaque test
	beforeEach(async () => {
		jest.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: mockUserService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
				{
					provide: CosmeticService,
					useValue: mockCosmeticService,
				},
				{
					provide: getModelToken("Cosmetic"),
					useValue: mockCosmeticModel,
				},
				{
					provide: Model,
					useValue: mockUserModel,
				},
				{
					provide: getModelToken(User.name),
					useValue: mockUserModel,
				},
				{ provide: APP_GUARD, useValue: { canActivate: () => true } },
			],
		}).compile();

		userService = moduleRef.get(UserService);
		userController = moduleRef.get(UserController);
	});

	describe("getUsers", () => {
		it("should return an array of user dtos", async () => {
			mockUserService.getAll.mockResolvedValue([new UserDto(expectedUser1), new UserDto(expectedUser2)]);

			const result = await userController.getUsers();

			expect(result).toEqual([new UserDto(expectedUser1), new UserDto(expectedUser2)]);
			expect(mockUserService.getAll).toHaveBeenCalledTimes(1);
		});

        it("should return an empty list if no users exist", async () => {
			mockUserService.getAll.mockResolvedValue([]);

			const result = await userController.getUsers();

			expect(result).toEqual([]);
			expect(mockUserService.getAll).toHaveBeenCalledTimes(1);
		});

        it("should throw an error if the service fails", async () => {
			mockUserService.getAll.mockRejectedValue(new Error("Service error"));

			await expect(userController.getUsers()).rejects.toThrow("Service error");
			expect(mockUserService.getAll).toHaveBeenCalledTimes(1);
		});
    });

    describe("getUserByUsername", () => {
        it("should return a user dto when user found", async () => {
            mockUserService.getByUsername.mockResolvedValue(new UserDto(expectedUser1));
            const result = await userController.getUserByUsername(mockRequest, "testuser1");
            expect(result).toEqual(new UserDto(expectedUser1));
            expect(mockUserService.getByUsername).toHaveBeenCalledWith("testuser1");
        });
    });

});

