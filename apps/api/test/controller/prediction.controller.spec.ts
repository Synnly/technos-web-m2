import { PredictionController } from "../../src/prediction/prediction.controller";
import { PredictionService } from "../../src/prediction/prediction.service";
import { Test } from "@nestjs/testing";
import { Prediction, PredictionStatus } from "../../src/prediction/prediction.schema";
import { User } from "../../src/user/user.schema";
import { BadRequestException, HttpException, NotFoundException } from "@nestjs/common/exceptions";
import { HttpStatus } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "../../src/guards/auth.guard";
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
	dateFin: new Date("3025-12-31"),
	options: { yes: 10, no: 5 },
	user_id: (expectedUser1 as any)._id,
	result: "",
} as Prediction;

const expectedPred2 = {
	_id: "p2",
	title: "Will team A win?",
	description: "Match outcome",
	status: PredictionStatus.Valid,
	createdAt: new Date(),
	dateFin: new Date("3025-11-30"),
	options: { teamA: 3, teamB: 7 },
	user_id: (expectedUser1 as any)._id,
	result: "",
} as Prediction;

const expectedPredictions = [expectedPred1, expectedPred2];

const { _id, ...rest } = expectedPred1;

const mockPredictionService = {
	getAll: jest.fn(),
	getById: jest.fn(),
	createPrediction: jest.fn(),
	createOrUpdateById: jest.fn(),
	deleteById: jest.fn(),
	validatePrediction: jest.fn(),
	getWaitingPredictions: jest.fn(),
	getPredictionsByStatus: jest.fn(),
	getExpiredPredictions: jest.fn(),
	getValidPredictions: jest.fn(),
	getPredictionTimeline: jest.fn(),
};

describe("PredictionController", () => {
	let predictionService: PredictionService;
	let predictionController: PredictionController;

	beforeEach(async () => {
		jest.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			controllers: [PredictionController],
			providers: [
				{
					provide: PredictionService,
					useValue: mockPredictionService,
				},
				{
					provide: JwtService,
					useValue: { verify: jest.fn(), sign: jest.fn() },
				},
				{
					provide: AuthGuard,
					useValue: { canActivate: jest.fn().mockReturnValue(true) },
				},
				{ provide: APP_GUARD, useValue: { canActivate: () => true } },
				{ provide: ConfigService, useValue: { get: jest.fn(() => "test-secret") } },
			],
		}).compile();

		predictionController = moduleRef.get(PredictionController);
		predictionService = moduleRef.get(PredictionService);
	});

	describe("getPredictions", () => {
		it("should return all predictions", async () => {
			mockPredictionService.getAll.mockResolvedValue(expectedPredictions);

			await predictionController.getPredictions();

			expect(predictionService.getAll).toHaveBeenCalled();
		});
	});

	describe("getPredictions", () => {
		it("should return empty array when none exists", async () => {
			mockPredictionService.getAll.mockResolvedValue([]);

			await predictionController.getPredictions();

			expect(predictionService.getAll).toHaveBeenCalled();
		});
	});

	describe("getPredictionById", () => {
		it("should return a prediction when found", async () => {
			mockPredictionService.getById.mockResolvedValue(expectedPred1);

			await predictionController.getPredictionById(expectedPred1._id!);

			expect(predictionService.getById).toHaveBeenCalledWith(expectedPred1._id);
		});

		it("should return 404 when not found", async () => {
			mockPredictionService.getById.mockResolvedValue(null);

			await expect(predictionController.getPredictionById("unknown")).rejects.toThrow(NotFoundException);

			expect(predictionService.getById).toHaveBeenCalledWith("unknown");
		});

		it("should return 400 when id is missing", async () => {
			await expect(predictionController.getPredictionById("")).rejects.toThrow(BadRequestException);
		});
	});

	describe("createPrediction", () => {
		it("should create a prediction and return 201", async () => {
			mockPredictionService.createPrediction.mockResolvedValue(expectedPred1);

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			const result = await predictionController.createPrediction(mockReq, expectedPred1);

			expect(predictionService.createPrediction).toHaveBeenCalledWith(
				expect.objectContaining({
					title: expectedPred1.title,
					dateFin: expectedPred1.dateFin,
					user_id: (expectedUser1 as any)._id,
					options: expectedPred1.options,
				}),
			);
			expect(result).toBe(expectedPred1);
		});

		it("should return 400 when missing the title", async () => {
			const badPred = {
				...expectedPred1,
				title: undefined,
			} as unknown as Prediction;

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, badPred)).rejects.toThrow(BadRequestException);
		});

		it("should return 400 on service error", async () => {
			mockPredictionService.createPrediction.mockImplementationOnce(() => {
				throw new BadRequestException("Error");
			});

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, expectedPred1)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when options count is 0", async () => {
			const predWithZeroOptions = {
				...expectedPred1,
				options: {},
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, predWithZeroOptions)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when options count is 1", async () => {
			const predWithOneOption = {
				...expectedPred1,
				options: { only: 0 },
			} as unknown as Prediction;

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, predWithOneOption)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when dateFin is before today", async () => {
			const badPred = {
				...expectedPred1,
				dateFin: new Date("2025-01-01"),
			} as unknown as Prediction;

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, badPred)).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when status is missing", async () => {
			const predNoStatus = {
				...expectedPred1,
				status: undefined,
			} as unknown as Prediction;

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, predNoStatus)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when status is invalid", async () => {
			const predBadStatus = {
				...expectedPred1,
				status: "NOT_VALID_STATUS" as any,
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, predBadStatus)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when prediction body is missing", async () => {
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, undefined as any)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when dateFin is missing", async () => {
			const badPred = {
				...expectedPred1,
				dateFin: undefined,
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, badPred)).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when authenticated user is missing", async () => {
			const mockReq = {} as any;
			const predNoUser = {
				...expectedPred1,
				user_id: undefined,
			} as unknown as Prediction;

			await expect(predictionController.createPrediction(mockReq, predNoUser)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when result is not empty", async () => {
			const badPred = {
				...expectedPred1,
				result: "yes",
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.createPrediction(mockReq, badPred)).rejects.toThrow(BadRequestException);
		});
	});

	describe("updatePredictionById", () => {
		it("should update and return 200", async () => {
			mockPredictionService.createOrUpdateById.mockResolvedValue(expectedPred1);

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			const result = await predictionController.updatePredictionById(mockReq, expectedPred1._id!, expectedPred1);

			expect(predictionService.createOrUpdateById).toHaveBeenCalledWith(
				expectedPred1._id,
				expect.objectContaining({
					title: expectedPred1.title,
					description: expectedPred1.description,
					status: expectedPred1.status,
					dateFin: expectedPred1.dateFin,
					options: expectedPred1.options,
					user_id: (expectedUser1 as any)._id,
				}),
			);
			expect(result).toBe(expectedPred1);
		});

		it("should return 400 when result is not empty", async () => {
			const badPred = {
				...expectedPred1,
				result: "yes",
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.updatePredictionById(mockReq, badPred._id, badPred)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when missing id", async () => {
			const mockReq = {} as any;

			await expect(predictionController.updatePredictionById(mockReq, "", expectedPred1)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when missing the title", async () => {
			const badPred = {
				...expectedPred1,
				title: undefined,
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.updatePredictionById(mockReq, badPred._id, badPred)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 on service error", async () => {
			mockPredictionService.createOrUpdateById.mockImplementationOnce(() => {
				throw new Error("Error");
			});

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(
				predictionController.updatePredictionById(mockReq, expectedPred1._id, expectedPred1),
			).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when options count is 0", async () => {
			const predWithZeroOptions = {
				...expectedPred1,
				options: {},
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(
				predictionController.updatePredictionById(mockReq, predWithZeroOptions._id, predWithZeroOptions),
			).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when options count is 1", async () => {
			const predWithOneOption = {
				...expectedPred1,
				options: { only: 0 },
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(
				predictionController.updatePredictionById(mockReq, predWithOneOption._id, predWithOneOption),
			).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when dateFin is before today", async () => {
			const badPred = {
				...expectedPred1,
				dateFin: new Date("2025-01-01"),
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.updatePredictionById(mockReq, badPred._id, badPred)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when status is missing", async () => {
			const predNoStatus = {
				...expectedPred1,
				status: undefined,
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(
				predictionController.updatePredictionById(mockReq, predNoStatus._id, predNoStatus),
			).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when status is invalid", async () => {
			const predBadStatus = {
				...expectedPred1,
				status: "NOT_VALID_STATUS" as any,
			} as unknown as Prediction;
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(
				predictionController.updatePredictionById(mockReq, predBadStatus._id, predBadStatus),
			).rejects.toThrow(BadRequestException);
		});

		it("should return 400 when prediction body is missing", async () => {
			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.updatePredictionById(mockReq, "1", undefined as any)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should return 400 when dateFin is missing", async () => {
			const badPred = {
				...expectedPred1,
				dateFin: undefined,
			} as unknown as Prediction;

			const mockReq = {
				user: { _id: (expectedUser1 as any)._id },
			} as any;

			await expect(predictionController.updatePredictionById(mockReq, badPred._id, badPred)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe("deletePrediction", () => {
		it("should delete and return 200", async () => {
			mockPredictionService.deleteById.mockResolvedValue(expectedPred1);

			await predictionController.deletePrediction(expectedPred1._id!);

			expect(predictionService.deleteById).toHaveBeenCalledWith(expectedPred1._id);
		});

		it("should return 404 when prediction is not found", async () => {
			mockPredictionService.deleteById.mockImplementation(() => {
				throw new HttpException("Not found", HttpStatus.NOT_FOUND);
			});

			await expect(predictionController.deletePrediction("unknown")).rejects.toThrow(HttpException);

			expect(predictionService.deleteById).toHaveBeenCalledWith("unknown");
		});
	});
	describe("getExpiredPredictions", () => {
		it("should return expired predictions from the service", async () => {
			const expiredPreds = [
				{
					_id: "p1",
					status: PredictionStatus.Valid,
					dateFin: new Date("2024-01-01"),
				},
				{
					_id: "p2",
					status: PredictionStatus.Valid,
					dateFin: new Date("2023-12-31"),
				},
			];
			mockPredictionService.getExpiredPredictions.mockResolvedValue(expiredPreds);

			await predictionController.getExpiredPredictions();

			expect(mockPredictionService.getExpiredPredictions).toHaveBeenCalled();
		});

		it("should return empty array if no expired predictions found", async () => {
			mockPredictionService.getExpiredPredictions.mockResolvedValue([]);

			await predictionController.getExpiredPredictions();

			expect(mockPredictionService.getExpiredPredictions).toHaveBeenCalled();
		});
	});

	describe("getWaitingPredictions", () => {
		it("should return waiting predictions from the service", async () => {
			const waitingPreds = [
				{
					_id: "p3",
					status: PredictionStatus.Waiting,
					dateFin: new Date("2025-12-31"),
				},
			];
			mockPredictionService.getWaitingPredictions.mockResolvedValue(waitingPreds);

			await predictionController.getWaitingPredictions();

			expect(mockPredictionService.getWaitingPredictions).toHaveBeenCalled();
		});

		it("should return empty array if no waiting predictions found", async () => {
			mockPredictionService.getWaitingPredictions.mockResolvedValue([]);

			await predictionController.getWaitingPredictions();

			expect(mockPredictionService.getWaitingPredictions).toHaveBeenCalled();
		});
	});

	describe("getValidPredictions", () => {
		it("should call service and return valid predictions", async () => {
			const expected = [expectedPred1];
			mockPredictionService.getValidPredictions.mockResolvedValue(expected);

			await predictionController.getValidPredictions();

			expect(mockPredictionService.getValidPredictions).toHaveBeenCalled();
		});

		it("should return empty array if no valid predictions", async () => {
			mockPredictionService.getValidPredictions.mockResolvedValue([]);

			await predictionController.getValidPredictions();

			expect(mockPredictionService.getValidPredictions).toHaveBeenCalled();
		});
	});

	describe("getPredictionTimeline", () => {
		it("should call service and return timeline when params are valid", async () => {
			const expectedTimeline = [{ date: new Date("2024-01-01"), options: { yes: 1 } }];
			mockPredictionService.getPredictionTimeline.mockResolvedValue(expectedTimeline);

			const result = await predictionController.getPredictionTimeline(expectedPred1._id!, 5, true, false);

			expect(mockPredictionService.getPredictionTimeline).toHaveBeenCalledWith(expectedPred1._id, 5, true, false);
			expect(result).toBe(expectedTimeline);
		});

		it("should throw 400 when id is missing", async () => {
			await expect(predictionController.getPredictionTimeline("", 5, false, false)).rejects.toThrow(
				BadRequestException,
			);
		});

		it("should throw 400 when intervalMinutes is missing or <= 0", async () => {
			await expect(
				predictionController.getPredictionTimeline(expectedPred1._id!, 0, false, false),
			).rejects.toThrow(BadRequestException);

			await expect(
				predictionController.getPredictionTimeline(expectedPred1._id!, -5 as any, false, false),
			).rejects.toThrow(BadRequestException);

			await expect(
				// interval undefined
				(predictionController.getPredictionTimeline as any)(expectedPred1._id!),
			).rejects.toThrow(BadRequestException);
		});

		it("should use default values for votesAsPercentage and fromStart when omitted", async () => {
			const expectedTimeline = [{ date: new Date("2024-01-01"), options: {} }];
			mockPredictionService.getPredictionTimeline.mockResolvedValue(expectedTimeline);

			// Appel avec seulement id et intervalMinutes
			const result = await predictionController.getPredictionTimeline(expectedPred1._id!, 10 as any);

			expect(mockPredictionService.getPredictionTimeline).toHaveBeenCalledWith(
				expectedPred1._id,
				10,
				false,
				false,
			);
			expect(result).toBe(expectedTimeline);
		});

		it("should throw BadRequestException when underlying service throws", async () => {
			mockPredictionService.getPredictionTimeline.mockRejectedValue(new Error("service failure"));

			await expect(
				predictionController.getPredictionTimeline(expectedPred1._id!, 5, false, false),
			).rejects.toThrow(BadRequestException);
		});
	});
});
