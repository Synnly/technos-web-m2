import { UserController } from "../src/controller/user.controller";
import { UserService } from "../src/service/user.service";
import { Test } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';
import { User } from "../src/model/user.schema";
import { ModuleMocker, MockMetadata } from 'jest-mock';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { HttpStatus } from "@nestjs/common/enums/http-status.enum";

const moduleMocker = new ModuleMocker(global);

const expectedUser1 = { 
    _id: '1', 
    pseudo: 'testuser1', 
    motDePasse: 'hashedpassword', 
    points: 50, 
    pointsQuotidiensRecuperes: false
} as User;

const expectedUser2 = { 
    _id: '2', 
    pseudo: 'testuser2', 
    motDePasse: 'hashedpassword2', 
    points: 100, 
    pointsQuotidiensRecuperes: true
} as User;

const expectedUsers = [expectedUser1, expectedUser2];

const mockUserService = {
    getAll: jest.fn(),
    getByPseudo: jest.fn(),
    deleteById : jest.fn(),
};

// Mock du JwtService
const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe("UserController", () => {
    let userService: UserService;
    let userController: UserController;

    // Initialiser le module de test avant chaque test
    beforeEach(async () => {
        jest.clearAllMocks();
        
        const moduleRef = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                }
            ],
        })
        .compile();
        
        userService = moduleRef.get(UserService);
        userController = moduleRef.get(UserController);
    });


    

    describe('getUsers', () => {
        it('should return all users', async () => {
            // Configuration du mock pour retourner les utilisateurs attendus
            mockUserService.getAll.mockResolvedValue(expectedUsers);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUsers(mockResponse);

            // Vérifier que le service a été appelé correctement
            expect(userService.getAll).toHaveBeenCalled();

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUsers);
        });
    });

    describe('getUsers', () => {
        it('should return no users when no users exist', async () => {
            // Configuration du mock pour retourner les utilisateurs attendus
            mockUserService.getAll.mockResolvedValue([]);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUsers(mockResponse);

            // Vérifier que le service a été appelé correctement
            expect(userService.getAll).toHaveBeenCalled();

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith([]);
        });
    });




    describe('getUserByPseudo', () => {
        it('should return a user when found', async () => {
            const pseudo = 'testuser';

            // Configuration du mock pour retourner l'utilisateur attendu
            mockUserService.getByPseudo.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUserByPseudo(mockResponse, pseudo);

            // Vérifier que le service a été appelé correctement
            expect(userService.getByPseudo).toHaveBeenCalledWith(pseudo);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('getUserByPseudo', () => {
        it('should return 404 when user is not found by correct pseudo', async () => {
            const pseudo = 'unknownuser';
            
            // Configuration du mock pour retourner null (utilisateur non trouvé)
            mockUserService.getByPseudo.mockResolvedValue(null);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUserByPseudo(mockResponse, pseudo);

            // Vérifier que le service a été appelé correctement
            expect(userService.getByPseudo).toHaveBeenCalledWith(pseudo);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('getUserByPseudo', () => {
        it('should return 404 when user is not found by empty pseudo', async () => {
            const pseudo = '';
            
            // Configuration du mock pour retourner null (utilisateur non trouvé)
            mockUserService.getByPseudo.mockResolvedValue(null);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUserByPseudo(mockResponse, pseudo);

            // Vérifier que le service a été appelé correctement
            expect(userService.getByPseudo).toHaveBeenCalledWith(pseudo);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('deleteUser', () => {
        it('should delete and return a user was deleted', async () => {
            const userId = '1';
            
            // Configuration du mock pour retourner l'utilisateur attendu
            mockUserService.deleteById.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, userId);

            // Vérifier que le service a été appelé correctement
            expect(userService.deleteById).toHaveBeenCalledWith(userId);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

});