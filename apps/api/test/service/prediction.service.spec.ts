import { Test } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';
import { PredictionService } from "../../src/prediction/prediction.service";
import { Prediction, PredictionStatus } from "../../src/prediction/prediction.schema";
import { User } from "../../src/user/user.schema";
import { Vote } from "../../src/vote/vote.schema";

const expectedUser1 = { 
	_id: '1', 
	username: 'testuser1', 
	motDePasse: 'H@sh3dpassword', 
	points: 50, 
	dateDerniereRecompenseQuotidienne: null,
	predictions : [],
	votes : [],
	role: 'user',
	cosmeticsOwned: [],
	currentCosmetic: [],
} as User;

const expectedPred1 = {
	_id: 'p1',
	title: 'Will it rain tomorrow?',
	description: 'Simple weather prediction',
	status: PredictionStatus.Waiting,
	dateFin: new Date('3025-12-31'),
	options: { yes: 10, no: 5 },
	user_id: (expectedUser1 as any)._id,
	result: ''
} as Prediction;

const expectedPred2 = {
	_id: 'p2',
	title: 'Will team A win?',
	description: 'Match outcome',
	status: PredictionStatus.Valid,
	dateFin: new Date('3025-11-30'),
	options: { teamA: 3, teamB: 7 },
	user_id: (expectedUser1 as any)._id,
	result: ''
} as Prediction;

const expectedPredictions = [expectedPred1, expectedPred2];

interface MockPredModel {
	new (data: any): { save: jest.Mock; [key: string]: any };
	find: jest.Mock;
	findById: jest.Mock;
	findByIdAndDelete: jest.Mock;
}

const mockPredModel = jest.fn().mockImplementation((data) => ({
	...data,
	// retourne les données construites afin que l'_id fourni soit préservé dans les tests
	save: jest.fn().mockResolvedValue(data)
})) as unknown as MockPredModel;

mockPredModel.find = jest.fn();
mockPredModel.findById = jest.fn();
mockPredModel.findByIdAndDelete = jest.fn();

const mockUserModel = {
	findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
} as any;


const mockVoteModel = {
  find: jest.fn(),
  create: jest.fn(),
} as any;


describe('PredictionService', () => {
	let predictionService: PredictionService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			providers: [
				PredictionService,
				{ provide: getModelToken(Prediction.name), useValue: mockPredModel },
				{ provide: getModelToken('User'), useValue: mockUserModel },
				{ provide: getModelToken(Vote.name), useValue: mockVoteModel }, 
			],
		}).compile();

		predictionService = moduleRef.get(PredictionService);
	});

	describe('getAll', () => {
		it('should return predictions when found', async () => {
			mockPredModel.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(expectedPredictions) });

			const result = await predictionService.getAll();

			expect(mockPredModel.find).toHaveBeenCalled();
			expect(result).toEqual(expectedPredictions);
		});

		it('should return empty array when none found', async () => {
			mockPredModel.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) });

			const result = await predictionService.getAll();

			expect(mockPredModel.find).toHaveBeenCalled();
			expect(result).toEqual([]);
		});
	});

	describe('getById', () => {
		it('should return a prediction when found', async () => {
			mockPredModel.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(expectedPred1) });

			const result = await predictionService.getById('p1');

			expect(mockPredModel.findById).toHaveBeenCalledWith('p1');
			expect(result).toEqual(expectedPred1);
		});

		it('should return undefined when not found', async () => {
			mockPredModel.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(null) });

			const result = await predictionService.getById('unknown');

			expect(mockPredModel.findById).toHaveBeenCalledWith('unknown');
			expect(result).toBeUndefined();
		});
	});

	describe('createPrediction', () => {
			it('should create and return prediction', async () => {
				const newPred = { title: 'New pred', status: PredictionStatus.Waiting, dateFin: new Date('2025-01-01'), options: { a: 0, b: 0 } } as unknown as Prediction;

				const result = await predictionService.createPrediction(newPred);

				expect(mockPredModel).toHaveBeenCalledWith(expect.objectContaining({ title: newPred.title }));
				expect(result).toEqual(expect.objectContaining({ title: newPred.title, options: newPred.options }));
			});

			it('should push prediction id to user when created with user_id', async () => {
				const newPredWithUser = { title: 'With user', status: PredictionStatus.Waiting, dateFin: new Date('2025-01-03'), options: { a: 0, b: 0 }, user_id: (expectedUser1 as any)._id, _id: 'pnew' } as unknown as Prediction;

				const result = await predictionService.createPrediction(newPredWithUser);

				expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedUser1 as any)._id, { $push: { predictions: result._id } });
			});
	});

	describe('createOrUpdateById', () => {
		it('should update existing prediction', async () => {
			const existing = { ...expectedPred1, save: jest.fn().mockResolvedValue({ ...expectedPred1, title: 'Updated' }) };
			mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });

			const updated = await predictionService.createOrUpdateById('p1', { title: 'Updated' } as Prediction);

			expect(mockPredModel.findById).toHaveBeenCalledWith('p1');
			expect(existing.save).toHaveBeenCalled();
			expect(updated).toEqual(expect.objectContaining({ title: 'Updated' }));
		});

		it('should create new prediction when not existing', async () => {
			mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			const created = await predictionService.createOrUpdateById('newid', { title: 'Created' } as Prediction);

			// Le constructeur du modèle doit être appelé avec les données fournies, y compris _id
			expect(mockPredModel).toHaveBeenCalledWith(expect.objectContaining({ _id: 'newid', title: 'Created' }));
			// En sauvegardant un modèle construit avec un _id fourni, cet _id sera conservé
			expect(created).toEqual(expect.objectContaining({ _id: 'newid', title: 'Created' }));
		});

		it('should push prediction id to user when creating new with user_id', async () => {
			mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			const created = await predictionService.createOrUpdateById('newid', { title: 'Created', user_id: (expectedUser1 as any)._id } as Prediction);

			expect(mockPredModel).toHaveBeenCalledWith(expect.objectContaining({ _id: 'newid', title: 'Created', user_id: (expectedUser1 as any)._id }));
			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedUser1 as any)._id, { $push: { predictions: 'newid' } });
		});
	});

	describe('deleteById', () => {
		it('should delete and return document when found', async () => {
			mockPredModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPred1) });

			const result = await predictionService.deleteById('p1');

			expect(mockPredModel.findByIdAndDelete).toHaveBeenCalledWith('p1');
			expect(result).toEqual(expectedPred1);
		});

		it('should throw when not found', async () => {
			mockPredModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			await expect(predictionService.deleteById('unknown')).rejects.toThrow('Prédiction introuvable');

			expect(mockPredModel.findByIdAndDelete).toHaveBeenCalledWith('unknown');
		});

		it('should remove prediction id from user when deleted and user_id present', async () => {
			const deletedWithUser = { ...expectedPred1 };
			mockPredModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(deletedWithUser) });

			const result = await predictionService.deleteById('p1');

			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith((expectedUser1 as any)._id, { $pull: { predictions: deletedWithUser._id } });
			expect(result).toEqual(expectedPred1);
		});
	});

	describe('validatePrediction', () => {
		it('should throw if prediction is not found', async () => {
			mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			await expect(predictionService.validatePrediction('p1', 'yes')).rejects.toThrow('Prédiction introuvable');
			expect(mockPredModel.findById).toHaveBeenCalledWith('p1');
		});

		it('should throw if winning option is invalid', async () => {
			mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPred1) });

			await expect(predictionService.validatePrediction('p1', 'invalid')).rejects.toThrow('Option gagnante invalide');
		});

		it('should throw if no points on winning option', async () => {
		  const predWithNoPoints = { ...expectedPred1, options: { yes: 0, no: 15 }, save: jest.fn() };
		  mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(predWithNoPoints) });

		  mockVoteModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

		  await expect(predictionService.validatePrediction('p1', 'yes')).rejects.toThrow('Aucun point sur l’option gagnante');
		});


		it('should distribute rewards correctly and update prediction', async () => {
			const pred = { ...expectedPred1, save: jest.fn() };
			const fakeVotes = [
			{ user_id: 'u1', option: 'yes', amount: 4 },
			{ user_id: 'u2', option: 'no', amount: 5 },
			{ user_id: 'u3', option: 'yes', amount: 6 },
			];

			mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(pred) });
			mockVoteModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeVotes) });
			mockUserModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

			const result = await predictionService.validatePrediction('p1', 'yes');

			// totalPoints = 10 + 5 = 15, winningPoints = 10
			expect(result.ratio).toBe(15 / 10);
			expect(result.predictionId).toBe('p1');
			expect(result.winningOption).toBe('yes');

			expect(result.rewards).toEqual([
			{ user_id: 'u1', gain: Math.floor(4 * (15 / 10)) },
			{ user_id: 'u3', gain: Math.floor(6 * (15 / 10)) },
			]);

			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', { $inc: { points: expect.any(Number) } }, { new: true });
			expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('u3', { $inc: { points: expect.any(Number) } }, { new: true });

			expect(pred.status).toBe(PredictionStatus.Valid);
			expect(pred.result).toBe('yes');
			expect(pred.save).toHaveBeenCalled();
		});
	});

	describe('getExpiredPredictions', () => {
  	  it('should return expired valid predictions', async () => {
  	    const now = new Date();
  	    const expired = { ...expectedPred2, dateFin: new Date(now.getTime() - 1000) };

  	    mockPredModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([expired]) });

  	    const result = await predictionService.getExpiredPredictions();

  	    expect(mockPredModel.find).toHaveBeenCalledWith({
  	      dateFin: { $lte: expect.any(Date) },
  	      result: '',
  	      status: PredictionStatus.Valid,
  	    });
  	    expect(result).toEqual([expired]);
  	  });
  	});

  	describe('getWaitingPredictions', () => {
  	  it('should return waiting predictions with no result', async () => {
  	    mockPredModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([expectedPred1]) });

  	    const result = await predictionService.getWaitingPredictions();

  	    expect(mockPredModel.find).toHaveBeenCalledWith({
  	      status: PredictionStatus.Waiting,
  	      result: '',
  	    });
  	    expect(result).toEqual([expectedPred1]);
  	  });
  	});

	describe('getValidPredictions', () => {
  it('should return only predictions with status Valid and dateFin in the future', async () => {
    const now = new Date();
    const futurePred = { ...expectedPred1, status: PredictionStatus.Valid, dateFin: new Date(now.getTime() + 100000), save: jest.fn() };
    const pastPred = { ...expectedPred2, status: PredictionStatus.Valid, dateFin: new Date(now.getTime() - 100000), save: jest.fn() };

    // Simuler find pour qu'il ne retourne que la prédiction future
    mockPredModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([futurePred])
    });

    const result = await predictionService.getValidPredictions();

    expect(mockPredModel.find).toHaveBeenCalledWith({
      status: PredictionStatus.Valid,
      dateFin: { $gt: expect.any(Date) },
    });
    
    expect(result).toEqual([futurePred]);
  });
});

});


