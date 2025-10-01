import { Test } from "@nestjs/testing";
import { VoteController } from "../../src/vote/vote.controller";
import { Prediction, PredictionStatus } from "../../src/prediction/prediction.schema";
import { User } from "../../src/user/user.schema";
import { VoteService } from "../../src/vote/vote.service";

const expectedUser1 = { 
    _id: '1', 
    username: 'testuser1', 
    motDePasse: 'H@sh3dpassword', 
    points: 50, 
    dateDerniereRecompenseQuotidienne: null,
    predictions : [],
    votes : [],
    role: 'user'
} as User;

const expectedPred1 = {
    _id: 'p1',
    title: 'Will it rain tomorrow?',
    description: 'Simple weather prediction',
    status: PredictionStatus.Waiting,
    dateFin: new Date('3000-12-31'),
    options: { yes: 10, no: 5 },
    user_id: (expectedUser1 as any)._id,
    results: ''
} as Prediction;

const expectedVote1 = {
    _id: '1',
    user_id: (expectedUser1 as any)._id,
    prediction_id: (expectedPred1 as any)._id,
    option: 'yes',
    amount: 10,
    date: new Date('2024-01-01')
};

const mockVoteService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    createVote: jest.fn(),
    createOrUpdateVote: jest.fn(),
    deleteVote: jest.fn(),
};

describe('VoteController', () => {
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
            ],
        }).compile();

        voteService = moduleRef.get(VoteService);
        voteController = moduleRef.get(VoteController);
    });

    describe('getVotes', () => {
        it('should return an array of votes', async () => {
            mockVoteService.getAll.mockResolvedValue([expectedVote1]);

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;

            await voteController.getVotes(response);

            expect(voteService.getAll).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith([expectedVote1]);
        });

        it('should return an empty array if no votes exist', async () => {
            mockVoteService.getAll.mockResolvedValue([]);

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;

            await voteController.getVotes(response);

            expect(voteService.getAll).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith([]);
        });
    });

    describe('getVoteById', () => {
        it('should return a vote by id', async () => {
            mockVoteService.getById.mockResolvedValue(expectedVote1);

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            
            await voteController.getVoteById(response, '1');
            expect(voteService.getById).toHaveBeenCalledWith('1');
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith(expectedVote1);
        });

        it('should return 404 if no vote is found', async () => {
            mockVoteService.getById.mockResolvedValue(null);

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;

            await voteController.getVoteById(response, '1');
            expect(voteService.getById).toHaveBeenCalledWith('1');
            expect(status).toHaveBeenCalledWith(404);
            expect(json).toHaveBeenCalledWith({ message: 'Vote introuvable' });
        });
    });

    describe('createVote', () => {
        it('should create and return a new vote', async () => {
            const newVote = { ...expectedVote1, _id: "1" };

            mockVoteService.createVote.mockResolvedValue({ ...expectedVote1, _id: "1" });

            const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
            const mockRequest = { user: { _id: '1' } } as any;
            await voteController.createVote(mockRequest, mockResponse, newVote);

            expect(voteService.createVote).toHaveBeenCalledWith(expect.objectContaining({
                prediction_id: newVote.prediction_id,
                option: newVote.option,
                amount: newVote.amount,
                date: newVote.date
            }));
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedVote1);
        });

        it('should return 400 if the data is missing', async () => {
            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.createVote(req, response, null);

            expect(voteService.createVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Les données du vote sont requises' });
        });

        it('should return 400 if the user is missing', async () => {
            const newVote = { ...expectedVote1, _id: undefined };

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: null } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: "L'utilisateur authentifié est requis" });
        });

        it('should return 400 if the prediction_id is missing', async () => {
            const newVote = { ...expectedVote1, _id: undefined };
            delete (newVote as any).prediction_id;

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: "L'identifiant de la prédiction est requis" });
        });

        it('should return 400 if the option is missing', async () => {
            const newVote = { ...expectedVote1, _id: undefined };
            delete (newVote as any).option;

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Le choix est requis' });
        });

        it('should return 400 if the amount is missing', async () => {
            const newVote = { ...expectedVote1, _id: undefined };
            delete (newVote as any).amount;

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Le montant est requis' });
        });

        it('should return 400 if the amount is less than 1', async () => {
            const newVote = { ...expectedVote1, _id: undefined, amount: 0 };

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Le montant doit être au moins de 1 point' });
        });

        it('should return 400 if the date is missing', async () => {
            const newVote = { ...expectedVote1, _id: undefined };
            delete (newVote as any).date;

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'La date est requise' });
        });

        it('should return 400 if the user is not authenticated', async () => {
            const newVote = { ...expectedVote1, _id: undefined };

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: null } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: "L'utilisateur authentifié est requis" });
        });

        it('should return 400 if the service throws an error', async () => {
            const newVote = { ...expectedVote1, _id: undefined };

            mockVoteService.createVote.mockRejectedValue(new Error('Service error'));

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Service error' });
        });

        it('should return 400 if the user does not have enough points', async () => {
            const newVote = { ...expectedVote1, _id: undefined };

            mockVoteService.createVote.mockRejectedValue(new Error('Points insuffisants'));

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.createVote(req, response, newVote);

            expect(voteService.createVote).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Points insuffisants' });
        });
    });

    describe('updateVote', () => {
        it('should update and return the vote', async () => {
            const updatedVote = { ...expectedVote1, amount: 20 };

            mockVoteService.createOrUpdateVote.mockResolvedValue(updatedVote);

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '1', updatedVote);

            expect(voteService.createOrUpdateVote).toHaveBeenCalledWith('1', {
                user_id: '1',
                prediction_id: updatedVote.prediction_id,
                option: updatedVote.option,
                amount: updatedVote.amount,
                date: updatedVote.date
            });
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith(updatedVote);
        });

        it('should return 400 if the user_id is missing from vote data', async () => {
            const updatedVote = { ...expectedVote1, amount: 20 };
            delete (updatedVote as any).user_id;

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '1', updatedVote);

            expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: "L'identifiant de l'utilisateur est requis" });
        });

        it('should return 400 if the data is missing', async () => {
            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '1', null);

            expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Les données du vote sont requises' });
        });

        it('should return 400 if the id is missing', async () => {
            const updatedVote = { ...expectedVote1, amount: 20 };

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '', updatedVote);

            expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: "L'identifiant du vote est requis" });
        });

        it('should return 400 if the user is missing', async () => {
            const updatedVote = { ...expectedVote1, amount: 20 };

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: null } as any;
            await voteController.updateVote(req, response, '1', updatedVote);

            expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: "L'utilisateur authentifié est requis" });
        });

        it('should return 400 if the prediction_id is missing', async () => {
            const updatedVote = { ...expectedVote1, amount: 20 };
            delete (updatedVote as any).prediction_id;

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '1', updatedVote);

            expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: "L'identifiant de la prédiction est requis" });
        });

        it('should return 400 if the option is missing', async () => {
            const updatedVote = { ...expectedVote1, amount: 20 };
            delete (updatedVote as any).option;

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '1', updatedVote);

            expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Le choix est requis' });
        });

        it('should return 400 if the amount is missing', async () => {
            const updatedVote = { ...expectedVote1, amount: 20 };
            delete (updatedVote as any).amount;

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '1', updatedVote);

            expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Le montant est requis' });
        });

        it('should return 400 if the amount is less than 1', async () => {
            const updatedVote = { ...expectedVote1, amount: 0 };

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '1', updatedVote);

            expect(voteService.createOrUpdateVote).not.toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Le montant doit être au moins de 1 point' });
        });

        it('should return 400 if the service throws an error', async () => {
            const updatedVote = { ...expectedVote1, amount: 20 };

            mockVoteService.createOrUpdateVote.mockRejectedValue(new Error('Service error'));

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;
            const req = { user: { _id: '1' } } as any;

            await voteController.updateVote(req, response, '1', updatedVote);

            expect(voteService.createOrUpdateVote).toHaveBeenCalled();
            expect(status).toHaveBeenCalledWith(400);
            expect(json).toHaveBeenCalledWith({ message: 'Service error' });
        });
    });

    describe('deleteVote', () => {
        it('should delete and return the vote', async () => {
            mockVoteService.deleteVote.mockResolvedValue(expectedVote1);

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;

            await voteController.deleteVote(response, '1');

            expect(voteService.deleteVote).toHaveBeenCalledWith('1');
            expect(status).toHaveBeenCalledWith(200);
            expect(json).toHaveBeenCalledWith(expectedVote1);
        });

        it('should return 404 if no vote is found to delete', async () => {
            mockVoteService.deleteVote.mockResolvedValue(null);

            const json = jest.fn();
            const status = jest.fn(() => ({ json }));
            const response = { status } as any;

            await voteController.deleteVote(response, '1');

            expect(voteService.deleteVote).toHaveBeenCalledWith('1');
            expect(status).toHaveBeenCalledWith(404);
            expect(json).toHaveBeenCalledWith({ message: 'Vote introuvable' });
        });
    });
});