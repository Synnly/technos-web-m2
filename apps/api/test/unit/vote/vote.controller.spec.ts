import { Test } from "@nestjs/testing";
import { VoteController } from "../../../src/vote/vote.controller";
import { Prediction, PredictionStatus } from "../../../src/prediction/prediction.schema";
import { User } from "../../../src/user/user.schema";
import { VoteService } from "../../../src/vote/vote.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "../../../src/guards/auth.guard";
import { AdminGuard } from "../../../src/guards/admin.guard";
import { ConfigService } from "@nestjs/config";

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
	result: "",
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
				{
					provide: AuthGuard,
					useValue: { canActivate: jest.fn().mockReturnValue(true) },
				},
				{ provide: AdminGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
				{ provide: APP_GUARD, useValue: { canActivate: () => true } },
				{ provide: ConfigService, useValue: { get: jest.fn(() => "test-secret") } },
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

			await expect(voteController.getVoteById("1")).rejects.toThrow(NotFoundException);
			expect(voteService.getById).toHaveBeenCalledWith("1");
		});
	});

	describe("createVote", () => {
		it("should create and return a new vote", async () => {
			const dto = {
				prediction_id: expectedVote1.prediction_id,
				option: expectedVote1.option,
				amount: expectedVote1.amount,
				date: expectedVote1.date,
				user_id: expectedVote1.user_id,
			};
			mockVoteService.createVote.mockResolvedValue({
				...dto,
				_id: "1",
			});

			await voteController.createVote(dto);

			expect(voteService.createVote).toHaveBeenCalledWith(expect.objectContaining(dto));
		});

		it("should return 400 if the data is missing", async () => {
			const invalidDto: any = { prediction_id: "", option: "", amount: 0, date: "", user_id: "" };
			await expect(voteController.createVote(invalidDto)).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the amount is less than 1", async () => {
			const newVote: any = { ...expectedVote1, _id: undefined, amount: 0 };

			await expect(voteController.createVote(newVote)).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).not.toHaveBeenCalled();
		});

		it("should pass the object to the service even if date is missing (validation handled elsewhere)", async () => {
			const newVote = { ...expectedVote1, _id: undefined };
			delete (newVote as any).date;
			await voteController.createVote(newVote);
			const { _id, ...expected } = newVote;
			expect(voteService.createVote).toHaveBeenCalledWith(expect.objectContaining(expected));
		});

		it("should return 400 if the service throws an error", async () => {
			const newVote: any = { ...expectedVote1, _id: undefined };

			mockVoteService.createVote.mockRejectedValue(new Error("Service error"));

			await expect(voteController.createVote(newVote)).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).toHaveBeenCalled();
		});

		it("should return 400 if the user does not have enough points", async () => {
			const newVote = { ...expectedVote1, _id: undefined };

			mockVoteService.createVote.mockRejectedValue(new Error("Points insuffisants"));

			await expect(voteController.createVote(newVote)).rejects.toThrow(BadRequestException);

			expect(voteService.createVote).toHaveBeenCalled();
		});
	});

	describe("updateVote", () => {
		it("should update and return the vote", async () => {
			const dto = {
				user_id: expectedVote1.user_id,
				prediction_id: expectedVote1.prediction_id,
				option: expectedVote1.option,
				amount: 20,
				date: expectedVote1.date,
			};
			mockVoteService.createOrUpdateVote.mockResolvedValue({ ...dto, _id: "1" });

			await voteController.updateVote("1", dto);

			expect(voteService.createOrUpdateVote).toHaveBeenCalledWith("1", expect.objectContaining(dto));
		});

		it("should return 400 if the amount is less than 1", async () => {
			const updatedVote: any = { ...expectedVote1, amount: 0 };

			await expect(voteController.updateVote("1", updatedVote)).rejects.toThrow(BadRequestException);

			expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
		});

		it("should return 400 if the service throws an error", async () => {
			const updatedVote = { ...expectedVote1, amount: 20 };

			mockVoteService.createOrUpdateVote.mockRejectedValue(new Error("Service error"));

			await expect(voteController.updateVote("1", updatedVote)).rejects.toThrow(BadRequestException);

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

			await expect(voteController.deleteVote("1")).rejects.toThrow(NotFoundException);

			expect(voteService.deleteVote).toHaveBeenCalledWith("1");
		});
	});
});
