import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PublicationService } from '../../src/service/publication.service';
import { Publication } from '../../src/model/publication.schema';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';

const expectedPub1 = {
    _id: 'pub1',
    message: 'Hello world',
    datePublication: new Date('2025-10-01'),
    prediction_id: 'p1',
    parentPublication_id: undefined,
    user_id: 'u1'
} as unknown as Publication;

const expectedPub2 = {
    _id: 'pub2',
    message: 'Reply',
    datePublication: new Date('2025-10-02'),
    prediction_id: 'p1',
    parentPublication_id: 'pub1',
    user_id: 'u2'
} as unknown as Publication;

const expectedPublications = [expectedPub1, expectedPub2];

// Mock Mongoose Model shape
interface MockPubModel {
    new (data: any): { save: jest.Mock; [key: string]: any };
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndDelete: jest.Mock;
}

const mockPubModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data)
})) as unknown as MockPubModel;

mockPubModel.find = jest.fn();
mockPubModel.findById = jest.fn();
mockPubModel.findByIdAndDelete = jest.fn();

const mockUserModel = {
    findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
} as any;

describe('PublicationService', () => {
    let publicationService: PublicationService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const moduleRef = await Test.createTestingModule({
            providers: [
                PublicationService,
                { provide: getModelToken(Publication.name), useValue: mockPubModel },
                { provide: getModelToken('User'), useValue: mockUserModel },
            ],
        }).compile();

        publicationService = moduleRef.get(PublicationService);
    });

    describe('getAll', () => {
        it('should return publications when found', async () => {
            mockPubModel.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(expectedPublications) });

            const result = await publicationService.getAll();

            expect(mockPubModel.find).toHaveBeenCalled();
            expect(result).toEqual(expectedPublications);
        });

        it('should return empty array when none found', async () => {
            mockPubModel.find.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) });

            const result = await publicationService.getAll();

            expect(mockPubModel.find).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return a publication when found', async () => {
            mockPubModel.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(expectedPub1) });

            const result = await publicationService.getById('pub1');

            expect(mockPubModel.findById).toHaveBeenCalledWith('pub1');
            expect(result).toEqual(expectedPub1);
        });

        it('should return undefined when not found', async () => {
            mockPubModel.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(null) });

            const result = await publicationService.getById('unknown');

            expect(mockPubModel.findById).toHaveBeenCalledWith('unknown');
            expect(result).toBeUndefined();
        });
    });

    describe('createPublication', () => {
        it('should create and return publication', async () => {
            const newPub = { message: 'New', datePublication: new Date('2025-12-01'), prediction_id: 'p1', user_id: 'u1' } as unknown as Publication;

            const result = await publicationService.createPublication(newPub);

            expect(mockPubModel).toHaveBeenCalledWith(expect.objectContaining({ message: newPub.message }));
            expect(result).toEqual(expect.objectContaining({ message: newPub.message }));
        });
    });

    describe('createOrUpdateById', () => {
        it('should update existing publication', async () => {
            const existing: any = { ...expectedPub1, save: jest.fn().mockResolvedValue({ ...expectedPub1, message: 'Updated' }) };
            mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });

            const updated = await publicationService.createOrUpdateById('pub1', { message: 'Updated' } as Publication);

            expect(mockPubModel.findById).toHaveBeenCalledWith('pub1');
            expect(existing.save).toHaveBeenCalled();
            expect(updated).toEqual(expect.objectContaining({ message: 'Updated' }));
        });

        it('should create new publication when not existing', async () => {
            mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

            const created = await publicationService.createOrUpdateById('newid', { message: 'Created', user_id: 'u1' } as unknown as Publication);

            expect(mockPubModel).toHaveBeenCalledWith(expect.objectContaining({message: 'Created', user_id: 'u1'}));
            expect(created).toEqual(expect.objectContaining({message: 'Created', user_id: 'u1'}));

        });

        it('should not fail when updating fields partly', async () => {
            const existing: any = { ...expectedPub1, save: jest.fn().mockResolvedValue({ ...expectedPub1, message: 'Part' }) };
            mockPubModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(existing) });

            const updated = await publicationService.createOrUpdateById('pub1', { message: 'Part' } as Publication);

            expect(existing.save).toHaveBeenCalled();
            expect(updated).toEqual(expect.objectContaining({ message: 'Part' }));
        });
    });

    describe('deleteById', () => {
        it('should delete and return document when found', async () => {
            mockPubModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedPub1) });

            const result = await publicationService.deleteById('pub1');

            expect(mockPubModel.findByIdAndDelete).toHaveBeenCalledWith('pub1');
            expect(result).toEqual(expectedPub1);
        });

        it('should throw when not found', async () => {
            mockPubModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

            await expect(publicationService.deleteById('unknown')).rejects.toEqual(
                expect.objectContaining({ message: 'Publication not found', status: HttpStatus.NOT_FOUND })
            );

            expect(mockPubModel.findByIdAndDelete).toHaveBeenCalledWith('unknown');
        });

        it('should return normalized result and call user update if user present', async () => {
            const deletedWithUser: any = { ...expectedPub1 };
            mockPubModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(deletedWithUser) });

            const result = await publicationService.deleteById('pub1');

            expect(mockPubModel.findByIdAndDelete).toHaveBeenCalledWith('pub1');
            expect(result).toEqual(expectedPub1);
        });
    });
});
