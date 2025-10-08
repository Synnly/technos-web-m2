import { Test } from "@nestjs/testing";
import { VoteController } from "../../src/vote/vote.controller";
import {
	Prediction,
	PredictionStatus,
} from "../../src/prediction/prediction.schema";
import { User } from "../../src/user/user.schema";
import { VoteService } from "../../src/vote/vote.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

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

const expectedPred1 = {
	_id: "p1",
	title: "Will it rain tomorrow?",
	description: "Simple weather prediction",
	status: PredictionStatus.Waiting,
	createdAt: new Date(),
	dateFin: new Date("3000-12-31"),
	options: { yes: 10, no: 5 },
	user_id: (expectedUser1 as any)._id,
	results: "",
} as Prediction;

const expectedVote1 = {
	_id: "1",
	user_id: (expectedUser1 as any)._id,
	prediction_id: (expectedPred1 as any)._id,
	option: "yes",
	amount: 10,
	date: new Date("2024-01-01"),
};

const mockVoteService = {
	getAll: jest.fn(),
	getById: jest.fn(),
	createVote: jest.fn(),
	createOrUpdateVote: jest.fn(),
	deleteVote: jest.fn(),
};

describe("VoteController", () => {
	let voteController: VoteController;
	let voteService: VoteService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			controllers: [VoteController],
			providers: [
				{
					provide: VoteService,
					useValue: mockVoteService,
				},
				{
					provide: JwtService,
					useValue: { verify: jest.fn(), sign: jest.fn() },
				},
				{ provide: APP_GUARD, useValue: { canActivate: () => true } },
			],
		}).compile();

		voteService = moduleRef.get(VoteService);
		voteController = moduleRef.get(VoteController);
	});

	describe("getVotes", () => {
		it("should return an array of votes", async () => {
			mockVoteService.getAll.mockResolvedValue([expectedVote1]);

			await voteController.getVotes();

			expect(voteService.getAll).toHaveBeenCalled();
		});

		it("should return an empty array if no votes exist", async () => {
			mockVoteService.getAll.mockResolvedValue([]);

			await voteController.getVotes();

			expect(voteService.getAll).toHaveBeenCalled();
		});
	});

	describe("getVoteById", () => {
		it("should return a vote by id", async () => {
			mockVoteService.getById.mockResolvedValue(expectedVote1);

			await voteController.getVoteById("1");
			expect(voteService.getById).toHaveBeenCalledWith("1");
		});

		it("should return 404 if no vote is found", async () => {
			mockVoteService.getById.mockResolvedValue(null);

			await expect(voteController.getVoteById("1")).rejects.toThrow(
				NotFoundException,
			);
			expect(voteService.getById).toHaveBeenCalledWith("1");
		});
	});

	describe("createVote", () => {
		it("should create and return a new vote", async () => {
			const newVote = { ...expectedVote1, _id: "1" };

			mockVoteService.createVote.mockResolvedValue({
				...expectedVote1,
				_id: "1",
			});

			const mockRequest = { user: { _id: "1" } } as any;
			await voteController.createVote(mockRequest, newVote);

			expect(voteService.createVote).toHaveBeenCalledWith(
				expect.objectContaining({
					prediction_id: newVote.prediction_id,
					option: newVote.option,
					amount: newVote.amount,
					date: newVote.date,
				}),
			);
		});

		it("should return 400 if the data is missing", async () => {
			const req = { user: { _id: "1" } } as any;

			await expect(voteController.createVote(req, null)).rejects.toThrow(
				BadRequestException,
			);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the user is missing", async () => {
			const newVote = { ...expectedVote1, _id: undefined };
			const req = { user: null } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the prediction_id is missing", async () => {
			const newVote = { ...expectedVote1, _id: undefined };
			delete (newVote as any).prediction_id;
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the option is missing", async () => {
			const newVote = { ...expectedVote1, _id: undefined };
			delete (newVote as any).option;
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the amount is missing", async () => {
			const newVote = { ...expectedVote1, _id: undefined };
			delete (newVote as any).amount;
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the amount is less than 1", async () => {
			const newVote = { ...expectedVote1, _id: undefined, amount: 0 };
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the date is missing", async () => {
			const newVote = { ...expectedVote1, _id: undefined };
			delete (newVote as any).date;
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the user is not authenticated", async () => {
			const newVote = { ...expectedVote1, _id: undefined };
			const req = { user: null } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the service throws an error", async () => {
			const newVote = { ...expectedVote1, _id: undefined };

			mockVoteService.createVote.mockRejectedValue(
				new Error("Service error"),
			);
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).toHaveBeenCalled();
		});

		it("should return 400 if the user does not have enough points", async () => {
			const newVote = { ...expectedVote1, _id: undefined };

			mockVoteService.createVote.mockRejectedValue(
				new Error("Points insuffisants"),
			);
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.createVote(req, newVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).toHaveBeenCalled();
		});
	});

	describe("updateVote", () => {
		it("should update and return the vote", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };

			mockVoteService.createOrUpdateVote.mockResolvedValue(updatedVote);
			const req = { user: { _id: "1" } } as any;

			await voteController.updateVote(req, "1", updatedVote);

			expect(voteService.createOrUpdateVote).toHaveBeenCalledWith("1", {
				user_id: "1",
				prediction_id: updatedVote.prediction_id,
				option: updatedVote.option,
				amount: updatedVote.amount,
				date: updatedVote.date,
			});
		});

		it("should return 400 if the user_id is missing from vote data", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };
			delete (updatedVote as any).user_id;
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.updateVote(req, "1", updatedVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the data is missing", async () => {
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.updateVote(req, "1", null),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the id is missing", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.updateVote(req, "", updatedVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the user is missing", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };
			const req = { user: null } as any;

			await expect(
				voteController.updateVote(req, "1", updatedVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the prediction_id is missing", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };
			delete (updatedVote as any).prediction_id;
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.updateVote(req, "1", updatedVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the option is missing", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };
			delete (updatedVote as any).option;
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.updateVote(req, "1", updatedVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the amount is missing", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };
			delete (updatedVote as any).amount;
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.updateVote(req, "1", updatedVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the amount is less than 1", async () => {
			const updatedVote = { ...expectedVote1, amount: 0 };
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.updateVote(req, "1", updatedVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the service throws an error", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };

			mockVoteService.createOrUpdateVote.mockRejectedValue(
				new Error("Service error"),
			);
			const req = { user: { _id: "1" } } as any;

			await expect(
				voteController.updateVote(req, "1", updatedVote),
			).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).toHaveBeenCalled();
		});
	});

	describe("deleteVote", () => {
		it("should delete and return the vote", async () => {
			mockVoteService.deleteVote.mockResolvedValue(expectedVote1);

			await voteController.deleteVote("1");

			expect(voteService.deleteVote).toHaveBeenCalledWith("1");
		});

		it("should return 404 if no vote is found to delete", async () => {
			mockVoteService.deleteVote.mockResolvedValue(null);

			await expect(voteController.deleteVote("1")).rejects.toThrow(
				NotFoundException,
			);

			expect(voteService.deleteVote).toHaveBeenCalledWith("1");
		});
	});
});
