import { UserController } from "../../../src/user/user.controller";
import { UserService } from "../../../src/user/user.service";
import { Test } from "@nestjs/testing";
import { Role, User } from "../../../src/user/user.schema";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { CosmeticService } from "../../../src/cosmetic/cosmetic.service";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDto } from "../../../src/user/dto/user.dto";
import { CreateUserDto } from "../../../src/user/dto/createuser.dto";
import { UpdateUserDto } from "../../../src/user/dto/updateuser.dto";

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
	user: { username: expectedUser1.username, role: Role.USER },
};

const mockAdminRequest = {
	user: { username: expectedUser1.username, role: Role.ADMIN },
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

		it("should throw NotFoundException when user not found", async () => {
			mockUserService.getByUsername.mockRejectedValue(new NotFoundException("User not found"));
			await expect(userController.getUserByUsername(mockAdminRequest, "nonexistentuser")).rejects.toThrow(
				NotFoundException,
			);
			expect(mockUserService.getByUsername).toHaveBeenCalledWith("nonexistentuser");
		});

		it("should throw BadRequestException when username is invalid", async () => {
			mockUserService.getByUsername.mockRejectedValue(new BadRequestException("Invalid username"));
			await expect(userController.getUserByUsername(mockAdminRequest, "")).rejects.toThrow(BadRequestException);
			expect(mockUserService.getByUsername).toHaveBeenCalledWith("");
		});

		it("should throw ForbiddenException when user is not admin and requesting other user", async () => {
			await expect(userController.getUserByUsername(mockRequest, "someUser")).rejects.toThrow(ForbiddenException);
			expect(mockUserService.getByUsername).not.toHaveBeenCalled();
		});

		it("should allow admin to get any existing user", async () => {
			mockUserService.getByUsername.mockResolvedValue(new UserDto(expectedUser2));
			const result = await userController.getUserByUsername(mockAdminRequest, "testuser2");
			expect(result).toEqual(new UserDto(expectedUser2));
			expect(mockUserService.getByUsername).toHaveBeenCalledWith("testuser2");
		});
	});

	describe("createUser", () => {
		it("should create a new user when all data is valid", async () => {
			mockUserService.createUser.mockResolvedValue(null);
			await userController.createUser(new CreateUserDto(expectedUser1));
			expect(mockUserService.createUser).toHaveBeenCalledWith(new CreateUserDto(expectedUser1));
		});

		it("should throw BadRequestException when user already exists", async () => {
			mockUserService.createUser.mockRejectedValue(new BadRequestException());
			await expect(userController.createUser(new CreateUserDto(expectedUser1))).rejects.toThrow(
				BadRequestException,
			);
			expect(mockUserService.createUser).toHaveBeenCalledWith(new CreateUserDto(expectedUser1));
		});
	});

	describe("updateUserByUsername", () => {
		it("should update only the password if the user has role Role.USER, user exists, password is valid and updated user is itself", async () => {
			const updateData = {
				...expectedUser1,
				motDePasse: "N3wP@ssw0rd!",
				predictions: expectedUser1.predictions.map((prediction) => prediction._id),
				votes: expectedUser1.votes.map((vote) => vote._id),
				points: 200,
			};
			mockUserService.createOrUpdateByUsername.mockResolvedValue(null);
			await userController.updateUserByUsername(mockRequest, "testuser1", new UpdateUserDto(updateData));
			expect(mockUserService.createOrUpdateByUsername).toHaveBeenCalledWith(
				"testuser1",
				new UpdateUserDto({ motDePasse: "N3wP@ssw0rd!" }),
			);
		});

		it("should throw ForbiddenException if the user has role Role.USER and tries to update another user", async () => {
			const updateData = {
				...expectedUser1,
				motDePasse: "N3wP@ssw0rd!",
				predictions: expectedUser1.predictions.map((prediction) => prediction._id),
				votes: expectedUser1.votes.map((vote) => vote._id),
				points: 200,
			};
			await expect(
				userController.updateUserByUsername(mockRequest, "someOtherUser", new UpdateUserDto(updateData)),
			).rejects.toThrow(ForbiddenException);
			expect(mockUserService.createOrUpdateByUsername).not.toHaveBeenCalled();
		});

		it("should update nothing if the user has role Role.USER and does not provide a password, user exists and updated user is itself", async () => {
			const updateData = {
				...expectedUser1,
				motDePasse: undefined,
				points: 200,
				predictions: expectedUser1.predictions.map((prediction) => prediction._id),
				votes: expectedUser1.votes.map((vote) => vote._id),
			};

			mockUserService.createOrUpdateByUsername.mockResolvedValue(null);
			await userController.updateUserByUsername(mockRequest, "testuser1", new UpdateUserDto(updateData));
			expect(mockUserService.createOrUpdateByUsername).toHaveBeenCalledWith("testuser1", new UpdateUserDto({}));
		});

		it("should update all fields if the user has role Role.ADMIN, user exists and updated user exists", async () => {
			const updateData = {
				...expectedUser2,
				motDePasse: "N3wP@ssw0rd!",
				points: 200,
				predictions: expectedUser2.predictions.map((prediction) => prediction._id),
				votes: expectedUser2.votes.map((vote) => vote._id),
			};
			mockUserService.createOrUpdateByUsername.mockResolvedValue(null);
			await userController.updateUserByUsername(mockAdminRequest, "testuser2", new UpdateUserDto(updateData));
			expect(mockUserService.createOrUpdateByUsername).toHaveBeenCalledWith(
				"testuser2",
				new UpdateUserDto(updateData),
			);
		});

		it("should throw BadRequestException when updated user does not exist", async () => {
			const updateData = {
				...expectedUser1,
				motDePasse: "N3wP@ssw0rd!",
				predictions: expectedUser1.predictions.map((prediction) => prediction._id),
				votes: expectedUser1.votes.map((vote) => vote._id),
				points: 200,
			};
			mockUserService.createOrUpdateByUsername.mockRejectedValue(new BadRequestException("User not found"));
			await expect(
				userController.updateUserByUsername(mockAdminRequest, "nonexistentuser", new UpdateUserDto(updateData)),
			).rejects.toThrow(BadRequestException);
			expect(mockUserService.createOrUpdateByUsername).toHaveBeenCalledWith(
				"nonexistentuser",
				new UpdateUserDto(updateData),
			);
		});
	});

	describe("deleteUser", () => {
		it("should delete the user if the user has role Role.USER and the user to delete is itself", async () => {
			mockUserService.deleteByUsername.mockResolvedValue(null);
			await userController.deleteUser(mockRequest, "testuser1");
			expect(mockUserService.deleteByUsername).toHaveBeenCalledWith("testuser1");
		});

		it("should throw ForbiddenException if the user has role Role.USER and tries to delete another user", async () => {
			await expect(userController.deleteUser(mockRequest, "someOtherUser")).rejects.toThrow(ForbiddenException);
			expect(mockUserService.deleteByUsername).not.toHaveBeenCalled();
		});

		it("should delete the user if the user has role Role.ADMIN and the user to delete exists", async () => {
			mockUserService.deleteByUsername.mockResolvedValue(null);
			await userController.deleteUser(mockAdminRequest, "testuser1");
			expect(mockUserService.deleteByUsername).toHaveBeenCalledWith("testuser1");
		});

		it("should throw NotFoundException when the user to delete does not exist", async () => {
			mockUserService.deleteByUsername.mockRejectedValue(new NotFoundException("User not found"));
			await expect(userController.deleteUser(mockAdminRequest, "nonexistentuser")).rejects.toThrow(
				NotFoundException,
			);
			expect(mockUserService.deleteByUsername).toHaveBeenCalledWith("nonexistentuser");
		});
	});

	describe("login", () => {
		it("should return a JWT token when credentials are valid", async () => {
			const loginData = { username: "testuser1", password: "ValidP@ssw0rd!" };
			mockUserService.getJwtToken.mockResolvedValue("mock-jwt-token");
			const result = await userController.login(loginData);
			expect(result).toEqual({ token: "mock-jwt-token" });
			expect(mockUserService.getJwtToken).toHaveBeenCalledWith(
				loginData.username,
				loginData.password,
				mockJwtService,
			);
		});

		it("should throw UnauthorizedException when credentials are invalid", async () => {
			const loginData = { username: "testuser1", password: "WrongP@ssw0rd!" };
			mockUserService.getJwtToken.mockRejectedValue(new UnauthorizedException("Invalid credentials"));
			await expect(userController.login(loginData)).rejects.toThrow(UnauthorizedException);
			expect(mockUserService.getJwtToken).toHaveBeenCalledWith(
				loginData.username,
				loginData.password,
				mockJwtService,
			);
		});

		it("should throw BadRequestException when username is missing", async () => {
			const loginData = { username: "", password: "SomeP@ssw0rd!" };
			await expect(userController.login(loginData)).rejects.toThrow(BadRequestException);
			expect(mockUserService.getJwtToken).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException when password is missing", async () => {
			const loginData = { username: "testuser1", password: "" };
			await expect(userController.login(loginData)).rejects.toThrow(BadRequestException);
			expect(mockUserService.getJwtToken).not.toHaveBeenCalled();
		});
	});

	describe("getDailyReward", () => {
		it("should return the daily reward when valid username is provided", async () => {
			mockUserService.claimDailyReward.mockResolvedValue(10);
			await userController.getDailyReward(mockRequest);
			expect(userService.claimDailyReward).toHaveBeenCalledWith(expectedUser1.username);
		});

		it("should throw BadRequestException when daily reward already claimed today", async () => {
			mockUserService.claimDailyReward.mockRejectedValue(
				new Error("Récompense quotidienne déjà réclamée aujourd'hui."),
			);
			await expect(userController.getDailyReward(mockRequest)).rejects.toThrow(
				BadRequestException,
			);
			expect(userService.claimDailyReward).toHaveBeenCalledWith(expectedUser1.username);
		});
	});

	describe("buyCosmetic", () => {
		const cosmeticId = "cos1";
		const mockCosmetic = { _id: cosmeticId, cost: 10 };

		beforeEach(() => {
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });
		});

		it("should buy a cosmetic when data is valid", async () => {
			mockCosmeticService.findById.mockResolvedValue(mockCosmetic);
			mockUserService.buyCosmetic.mockResolvedValue(expectedUser1);

			await userController.buyCosmetic(mockRequest, cosmeticId, expectedUser1.username);

			expect(userService.getByUsername).toHaveBeenCalledWith(expectedUser1.username);
			expect(mockCosmeticService.findById).toHaveBeenCalledWith(cosmeticId);
			expect(userService.buyCosmetic).toHaveBeenCalledWith(expectedUser1.username, mockCosmetic);
		});

		it("should throw NotFoundException when user not found", async () => {
			mockUserService.getByUsername.mockReturnValue(null);
			await expect(userController.buyCosmetic(mockRequest, cosmeticId, expectedUser1.username)).rejects.toThrow(
				NotFoundException,
			);
		});

		it("should throw NotFoundException when cosmetic not found", async () => {
			mockCosmeticService.findById.mockResolvedValue(null);
			mockUserService.getByUsername.mockReturnValue(expectedUser1);
			await expect(userController.buyCosmetic(mockRequest, cosmeticId, expectedUser1.username)).rejects.toThrow(
				NotFoundException,
			);
			expect(mockCosmeticService.findById).toHaveBeenCalledWith(cosmeticId);
		});

		it("should throw BadRequestException when cosmeticId is missing", async () => {
			await expect(userController.buyCosmetic(mockRequest, "", expectedUser1.username)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should throw ForbiddenException when user buys cosmetic for another user", async () => {
			const invalidReq = { user: { id: "otherId", cosmeticsOwned: [] } } as any;
			await expect(userController.buyCosmetic(invalidReq, cosmeticId, expectedUser1.username)).rejects.toThrow(
				ForbiddenException,
			);
		});
	});
});
