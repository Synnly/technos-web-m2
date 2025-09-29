import { PredictionController } from "../../src/controller/prediction.controller";
import { PredictionService } from "../../src/service/prediction.service";
import { Test } from "@nestjs/testing";
import { Prediction, PredictionStatus } from "../../src/model/prediction.schema";
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { HttpStatus } from "@nestjs/common/enums/http-status.enum";
import { User } from "src/model/user.schema";

const expectedUser1 = { 
	_id: '1', 
	username: 'testuser1', 
	motDePasse: 'H@sh3dpassword', 
	points: 50, 
	pointsQuotidiensRecuperes: false,
	predictions : [],
    votes : [],
	role: 'user'
} as User;

const expectedPred1 = {
	_id: 'p1',
	title: 'Will it rain tomorrow?',
	description: 'Simple weather prediction',
	status: PredictionStatus.Waiting,
	dateFin: new Date('2025-12-31'),
	options: { yes: 10, no: 5 },
	user_id: (expectedUser1 as any)._id,
	results: ''
} as Prediction;

const expectedPred2 = {
	_id: 'p2',
	title: 'Will team A win?',
	description: 'Match outcome',
	status: PredictionStatus.Valid,
	dateFin: new Date('2025-11-30'),
	options: { teamA: 3, teamB: 7 },
	user_id: (expectedUser1 as any)._id,
	results: ''
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
			const mockReq = {} as any;

			await predictionController.getPredictions(mockResponse);

			expect(predictionService.getAll).toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(expectedPredictions);
		});
	});

	describe('getPredictions', () => {
		it('should return empty array when none exists', async () => {
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

		it('should return 400 when id is missing', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

			await predictionController.getPredictionById(mockResponse, '');

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: "L'identifiant est requis" });
		});
	});

	describe('createPrediction', () => {
		it('should create a prediction and return 201', async () => {
			mockPredictionService.createPrediction.mockResolvedValue(expectedPred1);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, expectedPred1);

			// le service doit être appelé sans l'_id fourni par le client et inclure user_id et options
			expect(predictionService.createPrediction).toHaveBeenCalledWith(expect.objectContaining({ 
				title: expectedPred1.title, 
				dateFin: expectedPred1.dateFin, 
				user_id: (expectedUser1 as any)._id, 
				options: expectedPred1.options 
			}));
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith(expectedPred1);
		});

		it('should return 400 when missing the title', async () => {
			const badPred = { ...expectedPred1, title: undefined } as unknown as Prediction;
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, badPred);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Le titre est requis' });
		});

		it('should return 400 on service error', async () => {
			mockPredictionService.createPrediction.mockImplementationOnce(() => { throw new HttpException('Error', HttpStatus.BAD_REQUEST); });

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, expectedPred1);

			expect(predictionService.createPrediction).toHaveBeenCalledWith(rest);
			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error' });
		});

		it('should return 400 when options count is 0', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const predWithZeroOptions = { ...expectedPred1, options: {} } as unknown as Prediction;
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, predWithZeroOptions);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Au moins deux options sont requises' });
		});

		it('should return 400 when options count is 1', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const predWithOneOption = { ...expectedPred1, options: { only: 0 } } as unknown as Prediction;
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, predWithOneOption);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Au moins deux options sont requises' });
		});

		it('should return 400 when dateFin is before today', async () => {
			const badPred = { ...expectedPred1, dateFin: new Date("2025-01-01") } as unknown as Prediction;
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, badPred);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La date de fin doit être supérieure ou égale à aujourd\'hui' });
		});


		it('should return 400 when status is missing', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const predNoStatus = { ...expectedPred1, status: undefined } as unknown as Prediction;
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, predNoStatus);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Le statut est requis' });
		});

		it('should return 400 when status is invalid', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const predBadStatus = { ...expectedPred1, status: 'NOT_VALID_STATUS' as any } as unknown as Prediction;
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, predBadStatus);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Le statut est invalide' });
		});

		it('should return 400 when prediction body is missing', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, undefined as any);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La prédiction est requise' });
		});

		it('should return 400 when dateFin is missing', async () => {
			const badPred = { ...expectedPred1, dateFin: undefined } as unknown as Prediction;
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.createPrediction(mockReq, mockResponse, badPred);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La date de fin est requise' });
		});

		it('should return 400 when authenticated user is missing', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = {} as any;
			const predNoUser = { ...expectedPred1, user_id: undefined } as unknown as Prediction;

			await predictionController.createPrediction(mockReq, mockResponse, predNoUser);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: "L'utilisateur authentifié est requis" });
		});
	});

	describe('updatePredictionById', () => {
		it('should update and return 200', async () => {
			mockPredictionService.createOrUpdateById.mockResolvedValue(expectedPred1);

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = { user: { _id: (expectedUser1 as any)._id } } as any;

			await predictionController.updatePredictionById(mockReq, mockResponse, expectedPred1._id!, expectedPred1);

			expect(predictionService.createOrUpdateById).toHaveBeenCalledWith(expectedPred1._id, expect.objectContaining({ ...rest, options: expectedPred1.options }));
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(expectedPred1);
		});

		it('should return 400 when missing id', async () => {
			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			const mockReq = {} as any;

			await predictionController.updatePredictionById(mockReq, mockResponse, '', expectedPred1);

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

		it('should return 404 when prediction is not found', async () => {
			mockPredictionService.deleteById.mockImplementation(() => { throw new HttpException('Not found', HttpStatus.NOT_FOUND); });

			const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			await predictionController.deletePrediction(mockResponse, 'unknown');

			expect(predictionService.deleteById).toHaveBeenCalledWith('unknown');
			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not found' });
		});
	});
});

