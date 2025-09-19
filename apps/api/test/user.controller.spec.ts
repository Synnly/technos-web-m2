import { UserController } from "../src/controller/user.controller";
import { UserService } from "../src/service/user.service";
import { Test } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';
import { User } from "../src/model/user.schema";
import { ModuleMocker, MockMetadata } from 'jest-mock';
import { JwtService } from '@nestjs/jwt';

const moduleMocker = new ModuleMocker(global);

const expectedUser = { 
    _id: '1', 
    pseudo: 'testuser', 
    motDePasse: 'hashedpassword', 
    points: 50, 
    pointsQuotidiensRecuperes: false
} as User;

const mockUserService = {
    getByPseudo: jest.fn(),
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

    describe('getUserByPseudo', () => {
        it('should return a user when found', async () => {
            const pseudo = 'testuser';

            // Configuration du mock pour retourner l'utilisateur attendu
            mockUserService.getByPseudo.mockResolvedValue(expectedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUserByPseudo(mockResponse, pseudo);

            // Vérifier que le service a été appelé correctement
            expect(userService.getByPseudo).toHaveBeenCalledWith(pseudo);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
        });
    });

    describe('getUserByPseudo', () => {
        it('should return 404 when user is not found', async () => {
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
});