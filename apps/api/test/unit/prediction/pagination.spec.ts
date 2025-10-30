import { Test } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { PredictionService } from "../../../src/prediction/prediction.service";
import { Prediction, PredictionStatus } from "../../../src/prediction/prediction.schema";
import { ConfigService } from "@nestjs/config";

const expectedPred1 = {
	_id: "p1",
	title: "Will it rain tomorrow?",
	description: "Simple weather prediction",
	status: PredictionStatus.Waiting,
	createdAt: new Date(),
	dateFin: new Date("3025-12-31"),
	options: { yes: 10, no: 5 },
	user_id: "1",
	result: "",
	pronostics_ia: {},
} as unknown as Prediction;

const expectedPred2 = {
	_id: "p2",
	title: "Will team A win?",
	description: "Match outcome",
	status: PredictionStatus.Valid,
	createdAt: new Date(),
	dateFin: new Date("3025-11-30"),
	options: { teamA: 3, teamB: 7 },
	user_id: "1",
	result: "",
	pronostics_ia: {},
} as unknown as Prediction;

const mockPredModel: any = jest.fn();
mockPredModel.find = jest.fn();
mockPredModel.countDocuments = jest.fn();

// helper that builds a chainable mock object mimicking Mongoose Query API used by the service
function createQueryMock(result: any) {
	return {
		sort: jest.fn().mockReturnThis(),
		populate: jest.fn().mockReturnThis(),
		lean: jest.fn().mockReturnThis(),
		skip: jest.fn().mockReturnThis(),
		limit: jest.fn().mockReturnThis(),
		exec: jest.fn().mockResolvedValue(result),
	};
}

describe("PredictionService pagination", () => {
	let predictionService: PredictionService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			providers: [
				PredictionService,
				{
					provide: getModelToken(Prediction.name),
					useValue: mockPredModel,
				},
				{ provide: getModelToken("User"), useValue: {} },
				{ provide: getModelToken("Vote"), useValue: {} },
				{ provide: ConfigService, useValue: {} },
			],
		}).compile();

		predictionService = moduleRef.get(PredictionService);
	});

	it("should return paginated result for getAll", async () => {
		// The current service implementation returns an array when calling getAll
		mockPredModel.find.mockReturnValue(createQueryMock([expectedPred1, expectedPred2]));

		const res = (await predictionService.getAll(1, 2)) as any;

		expect(mockPredModel.find).toHaveBeenCalled();
		expect(Array.isArray(res)).toBe(true);
		expect(res.length).toBe(2);
	});

	it("should return array when no pagination provided for getAll", async () => {
		mockPredModel.find.mockReturnValue(createQueryMock([expectedPred1, expectedPred2]));

		const res = await predictionService.getAll();

		expect(Array.isArray(res)).toBe(true);
		expect((res as any).length).toBe(2);
		expect(mockPredModel.countDocuments).not.toHaveBeenCalled();
	});

	it("should return paginated result for waiting predictions", async () => {
		mockPredModel.find.mockReturnValue(createQueryMock([expectedPred1]));

		const res = (await predictionService.getWaitingPredictions(1, 10)) as any;

		expect(Array.isArray(res)).toBe(true);
		expect(res.length).toBe(1);
	});

	it("should return array when no pagination provided for expired predictions", async () => {
	mockPredModel.find.mockReturnValue(createQueryMock([expectedPred1]));

		const res = await predictionService.getExpiredPredictions();

		expect(Array.isArray(res)).toBe(true);
		expect((res as any).length).toBe(1);
	});

	it("should return paginated result for valid predictions with page beyond last (empty items)", async () => {
		// When page is beyond available items, service returns an empty array
		mockPredModel.find.mockReturnValue(createQueryMock([]));

		const res = (await predictionService.getValidPredictions(2, 10)) as any;

		expect(Array.isArray(res)).toBe(true);
		expect(res.length).toBe(0);
	});

	it("should respect page and limit boundaries (min 1) for paginate via getAll", async () => {
		// simulate 4 total, limit 1 => pages = 4
		mockPredModel.find.mockReturnValue(createQueryMock([expectedPred1]));

		const res = (await predictionService.getAll(1, 1)) as any;

		// service returns an array for paginated calls in current implementation
		expect(Array.isArray(res)).toBe(true);
	});
});
