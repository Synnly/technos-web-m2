import { Test } from "@nestjs/testing";
import { Vote } from "../../../src/vote/vote.schema";
import { VoteService } from "../../../src/vote/vote.service";
import { getModelToken } from "@nestjs/mongoose";
import { User } from "../../../src/user/user.schema";
import { Prediction, PredictionStatus } from "../../../src/prediction/prediction.schema";
import { CreateVoteDto } from "src/vote/dto/createvote.dto";

const expectedUser1 = {
	_id: "1",
	username: "testuser1",
	motDePasse: "H@sh3dpassword",
	points: 5000,
	dateDerniereRecompenseQuotidienne: null,
	predictions: [],
	votes: [],
	role: "user",
	cosmeticsOwned: [],
	currentCosmetic: [],
} as User;

const expectedPred1 = {
	_id: "1",
	title: "Will it rain tomorrow?",
	description: "Simple weather prediction",
	status: PredictionStatus.Waiting,
	createdAt: new Date(),
	dateFin: new Date("3025-12-31"),
	options: { yes: 10, no: 5 },
	user_id: (expectedUser1 as any)._id,
	result: "",
} as Prediction;

const expectedVote1 = {
	user_id: (expectedUser1 as any)._id,
	prediction_id: (expectedPred1 as any)._id,
	amount: 100,
	option: "yes",
	date: new Date(),
} as CreateVoteDto;


const expectedVote1_id = "1";
let votesStore: Record<string, any> = {};

const mockVoteModel: any = function (data: any) {
	return {
		...data,
		save: jest.fn().mockImplementation(function () {
			votesStore[this._id] = { ...this };
			return Promise.resolve({ ...this });
		}),
	};
};

mockVoteModel.find = jest.fn().mockImplementation(() => ({
	exec: jest.fn().mockResolvedValue(Object.values(votesStore)),
}));

mockVoteModel.findById = jest.fn().mockImplementation((id: string) => ({
	exec: jest.fn().mockResolvedValue(votesStore[id] || null),
}));

mockVoteModel.findByIdAndDelete = jest.fn().mockImplementation((id: string) => ({
	exec: jest.fn().mockImplementation(() => {
		const deleted = votesStore[id];
		delete votesStore[id];
		return Promise.resolve(deleted || null);
	}),
}));

mockVoteModel.create = jest.fn().mockImplementation((data: any) => {
	votesStore[data._id] = { ...data };
	return Promise.resolve({ ...data });
});

mockVoteModel.prototype.save = jest.fn().mockImplementation(function () {
	votesStore[this._id] = { ...this };
	return Promise.resolve({ ...this });
});

mockVoteModel.create = jest.fn().mockImplementation((data: any) => {
	votesStore[data._id] = { ...data };
	return Promise.resolve({ ...data });
});

const mockUserModel = {
	findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) }),
	findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
};

const mockPredictionModel = {
	findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPred1) }),
	findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
};

describe("VoteService", () => {
	let voteService: VoteService;

	beforeEach(async () => {
		jest.clearAllMocks();

		votesStore = {};

		const moduleRef = await Test.createTestingModule({
			providers: [
				VoteService,
				{ provide: getModelToken(Vote.name), useValue: mockVoteModel },
				{ provide: getModelToken(User.name), useValue: mockUserModel },
				{ provide: getModelToken(Prediction.name), useValue: mockPredictionModel },
			],
		}).compile();

		voteService = moduleRef.get(VoteService);
	});

	describe("getAll", () => {
		it("should return an array of votes", async () => {
			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([
					{
						_id: "1",
						user_id: expectedUser1,
						prediction_id: expectedPred1._id,
						choice: "yes",
					},
				]),
			});

			const votes = await voteService.getAll();
			expect(votes).toEqual([
				{
					_id: "1",
					user_id: expectedUser1._id,
					prediction_id: expectedPred1._id,
					choice: "yes",
				},
			]);
			expect(mockVoteModel.find).toHaveBeenCalled();
		});

		it("should return an empty array if no votes found", async () => {
			mockVoteModel.find.mockReturnValue({
				exec: jest.fn().mockResolvedValue([]),
			});

			const votes = await voteService.getAll();
			expect(votes).toEqual([]);
			expect(mockVoteModel.find).toHaveBeenCalled();
		});
	});

	describe("getById", () => {
		it("should return a vote by ID", async () => {
			mockVoteModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue({
					_id: "1",
					user_id: expectedUser1,
					prediction_id: expectedPred1._id,
					choice: "yes",
				}),
			});

			const vote = await voteService.getById("1");
			expect(vote).toEqual({
				_id: "1",
				user_id: expectedUser1._id,
				prediction_id: expectedPred1._id,
				choice: "yes",
			});
			expect(mockVoteModel.findById).toHaveBeenCalledWith("1");
		});

		it("should return undefined if vote not found", async () => {
			mockVoteModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			const vote = await voteService.getById("unknown");
			expect(vote).toBeUndefined();
			expect(mockVoteModel.findById).toHaveBeenCalledWith("unknown");
		});
	});

	describe("createVote", () => {
		it("should create and persist a new vote", async () => {
			mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });
			mockPredictionModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPred1) });

			await voteService.createVote(expectedVote1);
			await voteService.getById(expectedVote1_id);
			expect(mockUserModel.findById).toHaveBeenCalled();
			expect(mockPredictionModel.findById).toHaveBeenCalledWith(expectedPred1._id);
		});

		it("should throw an error if user not found", async () => {
			mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			await expect(voteService.createVote(expectedVote1)).rejects.toThrow("Utilisateur non trouvé");
			expect(mockUserModel.findById).toHaveBeenCalledWith(expectedVote1.user_id);
		});

		it("should throw an error if prediction not found", async () => {
			mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });
			mockPredictionModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			await expect(voteService.createVote(expectedVote1)).rejects.toThrow("Prédiction non trouvée");
			expect(mockUserModel.findById).toHaveBeenCalledWith(expectedVote1.user_id);
			expect(mockPredictionModel.findById).toHaveBeenCalledWith(expectedVote1.prediction_id);
		});

		it("should decrease user points when vote is created", async () => {
			mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });
			mockPredictionModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPred1) });

			await voteService.createVote(expectedVote1);
			expect(mockUserModel.findById).toHaveBeenCalledWith(expectedVote1.user_id);
			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(expectedUser1._id, {
				$inc: { points: -expectedVote1.amount },
			});
		});

		it("should throw an error if user has insufficient points", async () => {
			mockUserModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ ...expectedUser1, points: 50 }),
			});

			await expect(voteService.createVote(expectedVote1)).rejects.toThrow("Points insuffisants");
			expect(mockUserModel.findById).toHaveBeenCalledWith(expectedVote1.user_id);
		});

		it("should handle errors during user update in create", async () => {
			mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });
			mockPredictionModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPred1) });
			mockUserModel.findByIdAndUpdate.mockReturnValueOnce({
				exec: jest.fn().mockRejectedValue(new Error("Database error")),
			});

			await expect(voteService.createVote(expectedVote1)).rejects.toThrow("Erreur update user: Database error");
		});

		it("should throw if prediction is expired", async () => {
			mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });
			const expiredPred = { ...expectedPred1, dateFin: new Date(Date.now() - 1000) } as any;
			mockPredictionModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expiredPred) });

			await expect(voteService.createVote(expectedVote1)).rejects.toThrow("La prédiction est expirée");
		});
	});

	describe("createOrUpdateVote", () => {
		it("should update an existing vote", async () => {
			mockVoteModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue({
					...expectedVote1,
					save: jest.fn().mockResolvedValue({
						...expectedVote1,
						amount: 150,
						option: "yes",
					}),
				}),
			});
			mockUserModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedUser1),
			});
			mockPredictionModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedPred1),
			});

			await voteService.createOrUpdateVote("1", { ...expectedVote1, amount: 150, option: "yes" });
			const updatedVote = await voteService.getById("1");
			expect(updatedVote).toEqual(
				expect.objectContaining({
					user_id: (expectedUser1 as any)._id,
					prediction_id: (expectedPred1 as any)._id,
					amount: 150,
					option: "yes",
				}),
			);
			expect(mockVoteModel.findById).toHaveBeenCalledWith("1");
		});

		it("should create a new vote if not existing", async () => {
			mockVoteModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});
			mockUserModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedUser1),
			});
			mockPredictionModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedPred1),
			});

			await voteService.createOrUpdateVote("2", expectedVote1);

			expect(mockVoteModel.findById).toHaveBeenCalledWith("2");
			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(expectedUser1._id, { $push: { votes: "2" } });
		});

		it("should throw an error if user not found during creattion", async () => {
			mockUserModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			await expect(
				voteService.createOrUpdateVote(expectedVote1_id, { ...expectedVote1, amount: 150 }),
			).rejects.toThrow("Utilisateur non trouvé");
		});

		it("should throw an error if prediction not found during creattion", async () => {
			mockUserModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedUser1),
			});
			mockPredictionModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			await expect(voteService.createOrUpdateVote("1", expectedVote1)).rejects.toThrow("Prédiction non trouvée");
		});

		it("should throw an error if user has insufficient points during creation", async () => {
			mockUserModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ ...expectedUser1, points: 30 }),
			});
			mockPredictionModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedPred1),
			});

			await expect(voteService.createOrUpdateVote("1", { ...expectedVote1, amount: 150 })).rejects.toThrow(
				"Points insuffisants",
			);
		});

		it("should throw an error if user has insufficient points during update", async () => {
			mockVoteModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue({
					...expectedVote1,
					amount: 50,
					save: jest.fn(),
				}),
			});
			mockUserModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ ...expectedUser1, points: 30 }),
			});
			mockPredictionModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedPred1),
			});

			await expect(voteService.createOrUpdateVote("1", { ...expectedVote1, amount: 150 }))
				.rejects.toThrow("Points insuffisants");
		});

		it("should handle errors during user update in createOrUpdate", async () => {
			mockVoteModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});
			mockUserModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedUser1),
			});
			mockPredictionModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue(expectedPred1),
			});
			mockUserModel.findByIdAndUpdate.mockReturnValueOnce({
				exec: jest.fn().mockRejectedValue(new Error("Database error")),
			});

			await expect(voteService.createOrUpdateVote("2", expectedVote1)).rejects.toThrow(
				"Erreur création du vote: Database error",
			);
		});

		it("should throw if prediction is expired when creating new vote", async () => {
			mockVoteModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
			mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });
			const expiredPred = { ...expectedPred1, dateFin: new Date(Date.now() - 1000) } as any;
			mockPredictionModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expiredPred) });

			await expect(voteService.createOrUpdateVote("3", expectedVote1)).rejects.toThrow("La prédiction est expirée");
		});

		it("should throw if prediction is expired when updating existing vote", async () => {
			mockVoteModel.findById.mockReturnValue({
				exec: jest.fn().mockResolvedValue({ ...expectedVote1, amount: 10, save: jest.fn() }),
			});
			mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });
			const expiredPred = { ...expectedPred1, dateFin: new Date(Date.now() - 1000) } as any;
			mockPredictionModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expiredPred) });

			await expect(voteService.createOrUpdateVote("1", { ...expectedVote1, amount: 20 })).rejects.toThrow(
				"La prédiction est expirée",
			);
		});
	});

	describe("deleteVote", () => {
		it("should delete a vote by ID", async () => {
			mockVoteModel.findByIdAndDelete.mockReturnValue({
				exec: jest.fn().mockResolvedValue({
					_id: "1",
					user_id: (expectedUser1 as any)._id,
					prediction_id: (expectedPred1 as any)._id,
					option: "yes",
				}),
			});

			// After deletion, ensure subsequent findById returns null
			mockVoteModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			const deletedVote = await voteService.deleteVote("1");
			const getVote = await voteService.getById("1");
			expect(getVote).toBeUndefined();
			expect(mockVoteModel.findByIdAndDelete).toHaveBeenCalledWith("1");
		});

		it("should return undefined if vote to delete not found", async () => {
			mockVoteModel.findByIdAndDelete.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			const deletedVote = await voteService.deleteVote("unknown");
			expect(deletedVote).toBeUndefined();
			expect(mockVoteModel.findByIdAndDelete).toHaveBeenCalledWith("unknown");
		});

		it("should return user points and update prediction options when deleting vote", async () => {
			const voteToDelete = {
				_id: "1",
				user_id: (expectedUser1 as any)._id,
				prediction_id: (expectedPred1 as any)._id,
				amount: 100,
				option: "yes",
			};

			mockVoteModel.findByIdAndDelete.mockReturnValue({
				exec: jest.fn().mockResolvedValue(voteToDelete),
			});
			mockUserModel.findByIdAndUpdate.mockReturnValue({
				exec: jest.fn().mockResolvedValue({}),
			});
			mockPredictionModel.findByIdAndUpdate.mockReturnValue({
				exec: jest.fn().mockResolvedValue({}),
			});

			const deletedVote = await voteService.deleteVote("1");

			// After deletion, ensure subsequent findById returns null
			mockVoteModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
			expect(mockVoteModel.findByIdAndDelete).toHaveBeenCalledWith("1");
			const getVote = await voteService.getById("1");
			expect(getVote).toBeUndefined();

			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedUser1 as any)._id, {
				$pull: { votes: voteToDelete._id },
			});
			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedUser1 as any)._id, {
				$inc: { points: voteToDelete.amount },
			});
			expect(mockPredictionModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedPred1 as any)._id, {
				$inc: { [`options.${voteToDelete.option}`]: -voteToDelete.amount },
			});
		});

		it("should handle errors during vote deletion", async () => {
			const voteToDelete = {
				_id: "1",
				user_id: (expectedUser1 as any)._id,
				prediction_id: (expectedPred1 as any)._id,
				amount: 100,
				option: "yes",
			};

			mockVoteModel.findByIdAndDelete.mockReturnValue({
				exec: jest.fn().mockResolvedValue(voteToDelete),
			});
			mockUserModel.findByIdAndUpdate.mockReturnValue({
				exec: jest.fn().mockRejectedValue(new Error("Database error")),
			});

			await expect(voteService.deleteVote("1")).rejects.toThrow("Erreur suppression du vote:");
		});
	});
});
