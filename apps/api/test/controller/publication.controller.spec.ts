import { Test } from '@nestjs/testing';
import { PublicationController } from '../../src/controller/publication.controller';
import { PublicationService } from '../../src/service/publication.service';
import { Publication } from '../../src/model/publication.schema';
import { HttpException, HttpStatus } from '@nestjs/common';

const expectedPub1 = {
    _id: '507f1f77bcf86cd799439011',
    message: 'Hello world',
    datePublication: new Date('2025-10-01'),
    prediction_id: '507f1f77bcf86cd799439012',
    parentPublication_id: undefined,
    user_id: '507f1f77bcf86cd799439013'
} as unknown as Publication;

const expectedPub2 = {
    _id: '507f1f77bcf86cd799439014',
    message: 'Reply',
    datePublication: new Date('2025-10-02'),
    prediction_id: '507f1f77bcf86cd799439012',
    parentPublication_id: '507f1f77bcf86cd799439011',
    user_id: '507f1f77bcf86cd799439015'
} as unknown as Publication;

const expectedPublications = [expectedPub1, expectedPub2];

const mockPublicationService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    createPublication: jest.fn(),
    createOrUpdateById: jest.fn(),
    deleteById: jest.fn(),
    toggleLikePublication: jest.fn(),
};

describe('PublicationController', () => {
    let publicationController: PublicationController;
    let publicationService: PublicationService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const moduleRef = await Test.createTestingModule({
            controllers: [PublicationController],
            providers: [
                {
                    provide: PublicationService,
                    useValue: mockPublicationService,
                }
            ]
        }).compile();

        publicationService = moduleRef.get(PublicationService);
        publicationController = moduleRef.get(PublicationController);
    });

    describe('getPublications', () => {
        it('should return all publications', async () => {
            mockPublicationService.getAll.mockResolvedValue(expectedPublications);
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.getPublications(mockResponse as any);

            expect(publicationService.getAll).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedPublications);
        });

        it('should return empty array when none exists', async () => {
            mockPublicationService.getAll.mockResolvedValue([]);
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.getPublications(mockResponse as any);

            expect(publicationService.getAll).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([]);
        });
    });

    describe('getPublicationById', () => {
        it('should return a publication when found', async () => {
            mockPublicationService.getById.mockResolvedValue(expectedPub1);
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.getPublicationById(mockResponse as any, expectedPub1._id!);

            expect(publicationService.getById).toHaveBeenCalledWith(expectedPub1._id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedPub1);
        });

        it('should return 404 when not found', async () => {
            mockPublicationService.getById.mockResolvedValue(null);
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.getPublicationById(mockResponse as any, '507f1f77bcf86cd799439999');

            expect(publicationService.getById).toHaveBeenCalledWith('507f1f77bcf86cd799439999');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Publication non trouvée' });
        });

        it('should return 400 when id is missing', async () => {
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
            await publicationController.getPublicationById(mockResponse as any, '');

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "L'identifiant est requis" });
        });
    });

    describe('createPublication', () => {
        it('should create a publication and return 201', async () => {
            mockPublicationService.createPublication.mockResolvedValue(expectedPub1);
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, expectedPub1);

            expect(publicationService.createPublication).toHaveBeenCalledWith(expectedPub1);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedPub1);
        });

        it('should return 400 when publication body is missing', async () => {
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, undefined as any);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La publication est requise' });
        });

        it('should return 400 when message is missing', async () => {
            const bad = { ...expectedPub1, message: undefined } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Le message est requis' });
        });

        it('should return 400 when datePublication is missing', async () => {
            const bad = { ...expectedPub1, datePublication: undefined } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La date est requise' });
        });

        it('should return 400 when datePublication is before today', async () => {
            const bad = { ...expectedPub1, datePublication: new Date('2020-01-01') } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "La date de publication doit être supérieure ou égale à aujourd'hui" });
        });

        it('should return 400 when user_id is missing', async () => {
            const bad = { ...expectedPub1, user_id: undefined } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'utilisateur est requis' });
        });

        it('should return 400 when prediction_id is missing', async () => {
            const bad = { ...expectedPub1, prediction_id: undefined } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La prédiction est requise' });
        });

        it('should return 500 on service error', async () => {
            mockPublicationService.createPublication.mockImplementationOnce(() => { throw new Error('erreur'); });
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, expectedPub1);

            expect(publicationService.createPublication).toHaveBeenCalledWith(expectedPub1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'erreur' });
        });
    });

    describe('createOrUpdatePublicationById', () => {
        it('should update and return 200 when exists', async () => {
            mockPublicationService.createOrUpdateById.mockResolvedValue(expectedPub1);
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createOrUpdatePublicationById(mockResponse as any, expectedPub1._id!, expectedPub1);

            expect(publicationService.createOrUpdateById).toHaveBeenCalledWith(expectedPub1._id, expectedPub1);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedPub1);
        });

        it('should return 400 when publication body is missing', async () => {
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createOrUpdatePublicationById(mockResponse as any, expectedPub1._id!, undefined as any);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La publication est requise' });
        });

        it('should return 400 when id is missing', async () => {
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createOrUpdatePublicationById(mockResponse as any, '', expectedPub1);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'identifiant est requis' });
        });

        it('should return 400 when message is missing', async () => {
            const bad = { ...expectedPub1, message: undefined } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Le message est requis' });
        });

        it('should return 400 when datePublication is missing', async () => {
            const bad = { ...expectedPub1, datePublication: undefined } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La date est requise' });
        });

        it('should return 400 when datePublication is before today', async () => {
            const bad = { ...expectedPub1, datePublication: new Date('2020-01-01') } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "La date de publication doit être supérieure ou égale à aujourd'hui" });
        });

        it('should return 400 when user_id is missing', async () => {
            const bad = { ...expectedPub1, user_id: undefined } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'utilisateur est requis' });
        });

        it('should return 400 when prediction_id is missing', async () => {
            const bad = { ...expectedPub1, prediction_id: undefined } as unknown as Publication;
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createPublication(mockResponse as any, bad);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'La prédiction est requise' });
        });


        it('should return 500 on service error', async () => {
            mockPublicationService.createOrUpdateById.mockImplementationOnce(() => { throw new Error('erreur'); });
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.createOrUpdatePublicationById(mockResponse as any, expectedPub1._id!, expectedPub1);

            expect(publicationService.createOrUpdateById).toHaveBeenCalledWith(expectedPub1._id, expectedPub1);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'erreur' });
        });
    });

    describe('deletePublicationById', () => {
        it('should delete and return 200', async () => {
            mockPublicationService.deleteById.mockResolvedValue(expectedPub1);
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.deletePublicationById(mockResponse as any, expectedPub1._id!);

            expect(publicationService.deleteById).toHaveBeenCalledWith(expectedPub1._id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedPub1);
        });

        it('should return 400 when id missing', async () => {
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.deletePublicationById(mockResponse as any, '');

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "L'identifiant est requis" });
        });

        it('should return 500 when service throws', async () => {
            mockPublicationService.deleteById.mockImplementationOnce(() => { throw new Error('delete fail'); });
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.deletePublicationById(mockResponse as any, '507f1f77bcf86cd799439999');

            expect(publicationService.deleteById).toHaveBeenCalledWith('507f1f77bcf86cd799439999');
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'delete fail' });
        });
    });

    describe('toggleLikePublication', () => {
        it('should toggle like and return 200', async () => {
            const updatedPub = { ...expectedPub1, likes: ['507f1f77bcf86cd799439015'] };
            mockPublicationService.toggleLikePublication.mockResolvedValue(updatedPub);
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.toggleLikePublication(mockResponse as any, expectedPub1._id!, '507f1f77bcf86cd799439015');

            expect(publicationService.toggleLikePublication).toHaveBeenCalledWith(expectedPub1._id, '507f1f77bcf86cd799439015');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedPub);
        });

        it('should return 400 when publication id is missing', async () => {
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.toggleLikePublication(mockResponse as any, '', '507f1f77bcf86cd799439015');

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "L'identifiant de la publication est requis" });
        });

        it('should return 400 when user id is missing', async () => {
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.toggleLikePublication(mockResponse as any, expectedPub1._id!, '');

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "L'identifiant de l'utilisateur est requis" });
        });

        it('should return 500 when service throws error', async () => {
            mockPublicationService.toggleLikePublication.mockImplementationOnce(() => { throw new Error('toggle error'); });
            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };

            await publicationController.toggleLikePublication(mockResponse as any, expectedPub1._id!, '507f1f77bcf86cd799439015');

            expect(publicationService.toggleLikePublication).toHaveBeenCalledWith(expectedPub1._id, '507f1f77bcf86cd799439015');
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'toggle error' });
        });
    });
});