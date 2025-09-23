import { PredictionController } from "../../src/controller/prediction.controller";
import { PredictionService } from "../../src/service/prediction.service";
import { Test } from "@nestjs/testing";
import { Prediction, PredictionStatus } from "../../src/model/prediction.schema";
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { HttpStatus } from "@nestjs/common/enums/http-status.enum";

const expectedPred1 = {
	_id: 'p1',
	title: 'Will it rain tomorrow?',
	description: 'Simple weather prediction',
	status: PredictionStatus.EnAttente,
	dateFin: new Date('2025-12-31'),
	options: { yes: 10, no: 5 }
} as Prediction;

const expectedPred2 = {
	_id: 'p2',
	title: 'Will team A win?',
	description: 'Match outcome',
	status: PredictionStatus.Valid,
	dateFin: new Date('2025-11-30'),
	options: { teamA: 3, teamB: 7 }
} as Prediction;

const expectedPredictions = [expectedPred1, expectedPred2];

const { _id, ...rest } = expectedPred1;

const mockPredictionService = {
	getAll: jest.fn(),
	getById: jest.fn(),
	createPrediction: jest.fn(),
	createOrUpdateById: jest.fn(),
	deleteById: jest.fn(),
};

describe('PredictionController', () => {
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
				}
			],
		}).compile();

		predictionService = moduleRef.get(PredictionService);
		predictionController = moduleRef.get(PredictionController);
	});

	describe('getPredictions', () => {
		it('should return all predictions', async () => {
			mockPredictionService.getAll.mockResolvedValue(expectedPredictions);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.getPredictions(mockResponse);

			expect(predictionService.getAll).toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(expectedPredictions);
		});
	});

	describe('getPredictions', () => {
		it('should return empty array when none', async () => {
			mockPredictionService.getAll.mockResolvedValue([]);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.getPredictions(mockResponse);

			expect(predictionService.getAll).toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith([]);
		});
	});

	describe('getPredictionById', () => {
		it('should return a prediction when found', async () => {
			mockPredictionService.getById.mockResolvedValue(expectedPred1);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.getPredictionById(mockResponse, expectedPred1._id!);

			expect(predictionService.getById).toHaveBeenCalledWith(expectedPred1._id);
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(expectedPred1);
		});

		it('should return 404 when not found', async () => {
			mockPredictionService.getById.mockResolvedValue(null);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.getPredictionById(mockResponse, 'unknown');

			expect(predictionService.getById).toHaveBeenCalledWith('unknown');
			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Prédiction non trouvée' });
		});
	});

	describe('createPrediction', () => {
		it('should create a prediction and return 201', async () => {
			mockPredictionService.createPrediction.mockResolvedValue(expectedPred1);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.createPrediction(mockResponse, expectedPred1);

			// service should be called without client-provided _id
			expect(predictionService.createPrediction).toHaveBeenCalledWith(expect.objectContaining({ title: expectedPred1.title, dateFin: expectedPred1.dateFin }));
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith(expectedPred1);
		});

		it('should return 400 when missing title', async () => {
			const badPred = { ...expectedPred1, title: undefined } as unknown as Prediction;
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.createPrediction(mockResponse, badPred);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Le titre est requis' });
		});

		it('should return 400 on service error', async () => {
			mockPredictionService.createPrediction.mockImplementation(() => { throw new HttpException('Error', HttpStatus.BAD_REQUEST); });

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.createPrediction(mockResponse, expectedPred1);

			expect(predictionService.createPrediction).toHaveBeenCalledWith(rest);
			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error' });
		});
	});

	describe('updatePredictionById', () => {
		it('should update and return 200', async () => {
			mockPredictionService.createOrUpdateById.mockResolvedValue(expectedPred1);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.updatePredictionById(mockResponse, expectedPred1._id!, expectedPred1);

			expect(predictionService.createOrUpdateById).toHaveBeenCalledWith(expectedPred1._id, rest);
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(expectedPred1);
		});

		it('should return 400 when missing id', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.updatePredictionById(mockResponse, '', expectedPred1);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'identifiant est requis' });
		});
	});

	describe('deletePrediction', () => {
		it('should delete and return 200', async () => {
			mockPredictionService.deleteById.mockResolvedValue(expectedPred1);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.deletePrediction(mockResponse, expectedPred1._id!);

			expect(predictionService.deleteById).toHaveBeenCalledWith(expectedPred1._id);
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(expectedPred1);
		});

		it('should return 404 when deletion fails', async () => {
			mockPredictionService.deleteById.mockImplementation(() => { throw new HttpException('Not found', HttpStatus.NOT_FOUND); });

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.deletePrediction(mockResponse, 'unknown');

			expect(predictionService.deleteById).toHaveBeenCalledWith('unknown');
			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not found' });
		});
	});
});

