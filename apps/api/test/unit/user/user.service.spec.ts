import { UserService } from "../../../src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { User } from "../../../src/user/user.schema";
import { getModelToken } from "@nestjs/mongoose";
import { CosmeticService } from "../../../src/cosmetic/cosmetic.service";
import { UpdateUserDto } from "../../../src/user/dto/updateuser.dto";
import { PredictionService } from "../../../src/prediction/prediction.service";
import { VoteService } from "../../../src/vote/vote.service";

// Mock de bcrypt au niveau du module
jest.mock("bcrypt", () => ({
	compare: jest.fn(),
	hash: jest.fn(),
}));

import * as bcrypt from "bcrypt";

const expectedUser1 = {
	_id: "1",
	username: "testuser1",
	motDePasse: "hashedpassword",
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
	motDePasse: "hashedpassword2",
	points: 30,
	dateDerniereRecompenseQuotidienne: new Date(),
	predictions: [],
	votes: [],
	role: "user",
	cosmeticsOwned: [],
	currentCosmetic: [],
} as User;

const expectedUsers = [expectedUser1, expectedUser2];

// Définir le type pour le mock du UserModel
interface MockUserModel {
	new (data: any): {
		save: jest.Mock;
		[key: string]: any;
	};
	findOne: jest.Mock;
	find: jest.Mock;
	create: jest.Mock;
	findOneAndDelete: jest.Mock;
}

// Mock du UserModel avec le bon typage
const mockUserModel = jest.fn().mockImplementation((data) => ({
	...data,
	save: jest.fn().mockResolvedValue({
		_id: "3",
		...data,
		points: 0,
		dateDerniereRecompenseQuotidienne: null,
	}),
})) as unknown as MockUserModel;

const mockCosmeticService = {
	findAll: jest.fn(),
	findById: jest.fn(),
	create: jest.fn(),
};

// Ajouter les méthodes statiques
mockUserModel.findOne = jest.fn();
mockUserModel.find = jest.fn();
mockUserModel.create = jest.fn();
mockUserModel.findOneAndDelete = jest.fn();

// Mock du JwtService
const mockJwtService = {
	sign: jest.fn().mockReturnValue("mock-jwt-token"),
};

const mockPredictionService = {
	getByIds: jest.fn().mockResolvedValue([]),
};

const mockVoteService = {
	getByIds: jest.fn().mockResolvedValue([]),
};

const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

describe("UserService", () => {
	let userService: UserService;

	// Initialiser le module de test avant chaque test
	beforeEach(async () => {
		jest.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			providers: [
				{
					provide: UserService,
					useClass: UserService,
				},
				{
					provide: getModelToken(User.name),
					useValue: mockUserModel,
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
					provide: PredictionService,
					useValue: mockPredictionService,
				},
				{
					provide: VoteService,
					useValue: mockVoteService,
				},
			],
		}).compile();

		userService = moduleRef.get(UserService);
	});

	describe("getAll", () => {
		it("should return an array of users if users are found", async () => {
			mockUserModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUsers) });

			const result = await userService.getAll();

			expect(mockUserModel.find).toHaveBeenCalled();
			expect(result).toEqual(expectedUsers);
		});

		it("should return an empty array when no users found", async () => {
			mockUserModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

			const result = await userService.getAll();

			expect(mockUserModel.find).toHaveBeenCalled();
			expect(result).toEqual([]);
		});
	});

	describe("getByUsername", () => {
		it("should return a user when found", async () => {
			const username = expectedUser1.username;

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedUser1),
			});

			const result = await userService.getByUsername(username);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(result).toEqual(expectedUser1);
		});

		it("should return undefined when user not found", async () => {
			const username = "nonexistentuser";

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			const result = await userService.getByUsername(username);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(result).toBeUndefined();
		});
	});

	describe("createUser", () => {
		it("should create and return a new user when username is unique", async () => {
			const newUser = {
				username: "newuser",
				motDePasse: "plaintextpassword",
			} as User;

			// Simuler l'absence d'utilisateur existant avec le même username
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			mockBcryptHash.mockResolvedValue("hashedpassword");

			await userService.createUser(newUser);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: newUser.username });
			expect(mockUserModel).toHaveBeenCalledWith(
				expect.objectContaining({
					username: newUser.username,
					motDePasse: expect.any(String),
				}),
			);
		});

		it("should throw an error when username already exists", async () => {
			const newUser = {
				username: expectedUser1.username,
				motDePasse: "anotherpassword",
			} as User;

			// Simuler la présence d'un utilisateur existant avec le même username
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });

			await expect(userService.createUser(newUser)).rejects.toEqual(new Error("Username déjà utilisé."));

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: newUser.username });
			expect(mockUserModel).not.toHaveBeenCalled();
		});
	});

	describe("getJwtToken", () => {
		it("should return a JWT token for valid credentials", async () => {
			const username = expectedUser1.username;
			const role = expectedUser1.role;
			const motDePasse = "plaintextpassword";

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedUser1),
			});

			// Configurer bcrypt.compare pour retourner true
			mockBcryptCompare.mockResolvedValue(true);

			const result = await userService.getJwtToken(username, motDePasse, mockJwtService as unknown as JwtService);
			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(mockJwtService.sign).toHaveBeenCalledWith({ role, username });
			expect(result).toEqual({ token: "mock-jwt-token" });
		});

		it("should throw an error when user not found", async () => {
			const username = "nonexistentuser";
			const motDePasse = "somepassword";

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			await expect(
				userService.getJwtToken(username, motDePasse, mockJwtService as unknown as JwtService),
			).rejects.toEqual(new Error("L'utilisateur n'est pas trouvable"));

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(mockJwtService.sign).not.toHaveBeenCalled();
		});

		it("should throw an error for incorrect password", async () => {
			const username = expectedUser1.username;
			const motDePasse = "wrongpassword";

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedUser1),
			});

			// Configurer bcrypt.compare pour retourner false
			mockBcryptCompare.mockResolvedValue(false);

			await expect(
				userService.getJwtToken(username, motDePasse, mockJwtService as unknown as JwtService),
			).rejects.toEqual(new Error("Identifiants incorrects."));

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(mockJwtService.sign).not.toHaveBeenCalled();
		});
	});

	describe("createOrUpdateByUsername", () => {
		it("should update an existing user", async () => {
			const username = expectedUser1.username;
			const updatedData = new UpdateUserDto({
				username: "updateduser",
				motDePasse: "newpassword",
				points: 100,
				dateDerniereRecompenseQuotidienne: new Date(),
			});

			// Simuler la présence d'un utilisateur existant avec le même username
			const existingUser = {
				...expectedUser1,
				save: jest.fn().mockResolvedValue({
					...expectedUser1,
					...updatedData,
					motDePasse: "hashednewpassword", // Simuler le mot de passe hashé
				}),
			};
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingUser) });

			mockBcryptHash.mockResolvedValue("hashednewpassword");

			await userService.createOrUpdateByUsername(username, updatedData);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(existingUser.save).toHaveBeenCalled();
		});

		it("should create and return a new user when username does not exist", async () => {
			const username = "newuser";
			const updateUserDto = new UpdateUserDto({
				username: "newuser",
				motDePasse: "plaintextpassword",
			});

			// Simuler l'absence d'utilisateur existant avec le même username
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			mockBcryptHash.mockResolvedValue("hashedpassword");

			await userService.createOrUpdateByUsername(username, updateUserDto);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(mockUserModel).toHaveBeenCalledWith(
				expect.objectContaining({
					username: updateUserDto.username,
					motDePasse: expect.any(String),
				}),
			);
		});
	});

	describe("deleteByUsername", () => {
		it("should delete and return the user when found", async () => {
			const username = expectedUser1.username;

			mockUserModel.findOneAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });

			const result = await userService.deleteByUsername(username);

			expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ username });
			expect(result).toEqual(expectedUser1);
		});

		it("should throw an error when user to delete is not found", async () => {
			const username = "nonexistentuser";

			mockUserModel.findOneAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			await expect(userService.deleteByUsername(username)).rejects.toEqual(
				new Error("L'utilisateur n'est pas trouvable"),
			);

			expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ username });
		});
	});

	describe("claimDailyReward", () => {
		it("should add points and update date when claiming daily reward for the first time", async () => {
			const username = expectedUser1.username;
			const userWithoutReward = {
				...expectedUser1,
				dateDerniereRecompenseQuotidienne: null,
				points: 50,
				save: jest.fn().mockResolvedValue({
					...expectedUser1,
					points: 60,
					dateDerniereRecompenseQuotidienne: new Date(),
				}),
			};

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(userWithoutReward),
			});

			const result = await userService.claimDailyReward(username);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(userWithoutReward.save).toHaveBeenCalled();
			expect(result).toEqual(10);
		});

		it("should add points and update date when claiming daily reward after one day", async () => {
			const username = expectedUser1.username;
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const userWithOldReward = {
				...expectedUser1,
				dateDerniereRecompenseQuotidienne: yesterday,
				points: 50,
				save: jest.fn().mockResolvedValue({
					...expectedUser1,
					points: 60,
					dateDerniereRecompenseQuotidienne: new Date(),
				}),
			};

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(userWithOldReward),
			});

			const result = await userService.claimDailyReward(username);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(userWithOldReward.save).toHaveBeenCalled();
			expect(result).toEqual(10);
		});

		it("should throw an error when user not found", async () => {
			const username = "nonexistentuser";

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			await expect(userService.claimDailyReward(username)).rejects.toEqual(
				new Error("L\'utilisateur n\'est pas trouvable"),
			);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
		});

		it("should throw an error when daily reward already claimed today", async () => {
			const username = expectedUser1.username;
			const today = new Date();

			const userWithTodayReward = {
				...expectedUser1,
				dateDerniereRecompenseQuotidienne: today,
				points: 60,
				save: jest.fn(),
			};

			mockUserModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(userWithTodayReward),
			});

			await expect(userService.claimDailyReward(username)).rejects.toEqual(
				new Error("Récompense quotidienne déjà réclamée aujourd'hui."),
			);

			expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
			expect(userWithTodayReward.save).not.toHaveBeenCalled();
		});
	});

	describe("buyCosmetic", () => {
		it("should deduct cost, add cosmetic id to user and save", async () => {
			const user: any = {
				...expectedUser1,
				points: 50,
				cosmeticsOwned: [],
				save: jest.fn().mockResolvedValue({
					...expectedUser1,
					points: 40,
					cosmeticsOwned: ["cos1"],
				}),
			};
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

			const cosmetic: any = { _id: "cos1", cost: 10 };

			await userService.buyCosmetic(user, cosmetic);

			expect(user.save).toHaveBeenCalled();
		});

		it("should throw error if user not found", async () => {
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
			const cosmetic: any = { _id: "cos1", cost: 10 };
			await expect(userService.buyCosmetic("nonexistentuser", cosmetic)).rejects.toEqual(
				new Error("L'utilisateur n'est pas trouvable"),
			);
		});
		it("should throw error if user already owns the cosmetic", async () => {
			const user: any = {
				...expectedUser1,
				points: 50,
				cosmeticsOwned: ["cos1"],
				save: jest.fn(),
			};
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

			const cosmetic: any = { _id: "cos1", cost: 10 };
			await expect(userService.buyCosmetic(user.username, cosmetic)).rejects.toEqual(
				new Error("Vous possédez déjà ce cosmétique"),
			);
			expect(user.save).not.toHaveBeenCalled();
		});

		it("should throw error if user has insufficient points", async () => {
			const user: any = {
				...expectedUser1,
				points: 5,
				cosmeticsOwned: [],
				save: jest.fn(),
			};
			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

			const cosmetic: any = { _id: "cos2", cost: 10 };

			await expect(userService.buyCosmetic(user.username, cosmetic)).rejects.toEqual(
				new Error("Vous n'avez pas assez de points pour acheter ce cosmétique"),
			);
			expect(user.save).not.toHaveBeenCalled();
		});

		it("should propagate error when save fails", async () => {
			const user = {
				...expectedUser1,
				points: 50,
				cosmeticsOwned: [],
				save: jest.fn().mockRejectedValue(new Error("save failed")),
			};

			mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

			const cosmetic: any = { _id: "cos2", cost: 10 };

			await expect(userService.buyCosmetic(user.username, cosmetic)).rejects.toEqual(new Error("save failed"));
			expect(user.save).toHaveBeenCalled();
		});
	});
});
