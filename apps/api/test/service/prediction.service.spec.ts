import { Test } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';
import { PredictionService } from "../../src/service/prediction.service";
import { Prediction, PredictionStatus } from "../../src/model/prediction.schema";
import { HttpStatus } from "@nestjs/common/enums/http-status.enum";
import { HttpException } from "@nestjs/common/exceptions/http.exception";

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

// Mock Mongoose Model shape
interface MockPredModel {
	new (data: any): { save: jest.Mock; [key: string]: any };
	find: jest.Mock;
	findById: jest.Mock;
	findByIdAndDelete: jest.Mock;
}

const mockPredModel = jest.fn().mockImplementation((data) => ({
	...data,
	save: jest.fn().mockResolvedValue({ _id: 'created', ...data })
})) as unknown as MockPredModel;

mockPredModel.find = jest.fn();
mockPredModel.findById = jest.fn();
mockPredModel.findByIdAndDelete = jest.fn();

describe('PredictionService', () => {
	let predictionService: PredictionService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const moduleRef = await Test.createTestingModule({
			providers: [
				PredictionService,
				{ provide: getModelToken(Prediction.name), useValue: mockPredModel }
			],
		}).compile();

		predictionService = moduleRef.get(PredictionService);
	});

	describe('getAll', () => {
		it('should return predictions when found', async () => {
			mockPredModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPredictions) });

			const result = await predictionService.getAll();

			expect(mockPredModel.find).toHaveBeenCalled();
			expect(result).toEqual(expectedPredictions);
		});

		it('should return empty array when none found', async () => {
			mockPredModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

			const result = await predictionService.getAll();

			expect(mockPredModel.find).toHaveBeenCalled();
			expect(result).toEqual([]);
		});
	});

	describe('getById', () => {
		it('should return a prediction when found', async () => {
			mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPred1) });

			const result = await predictionService.getById('p1');

			expect(mockPredModel.findById).toHaveBeenCalledWith('p1');
			expect(result).toEqual(expectedPred1);
		});

		it('should return undefined when not found', async () => {
			mockPredModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

			const result = await predictionService.getById('unknown');

			expect(mockPredModel.findById).toHaveBeenCalledWith('unknown');
			expect(result).toBeUndefined();
		});
	});

	describe('createPrediction', () => {
		it('should create and return prediction', async () => {
			const newPred = { title: 'New pred', status: PredictionStatus.EnAttente } as Prediction;

			const result = await predictionService.createPrediction(newPred);

			expect(mockPredModel).toHaveBeenCalledWith(expect.objectContaining({ title: newPred.title }));
			expect(result).toEqual(expect.objectContaining({ _id: 'created', title: newPred.title }));
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

			// model constructor should be called with provided data including _id
			expect(mockPredModel).toHaveBeenCalledWith(expect.objectContaining({ _id: 'newid', title: 'Created' }));
			// saving a model that was constructed with a provided _id will keep that _id
			expect(created).toEqual(expect.objectContaining({ _id: 'newid', title: 'Created' }));
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

			await expect(predictionService.deleteById('unknown')).rejects.toEqual(
				expect.objectContaining({ message: 'Prediction not found', status: HttpStatus.NOT_FOUND })
			);

			expect(mockPredModel.findByIdAndDelete).toHaveBeenCalledWith('unknown');
		});
	});
});

