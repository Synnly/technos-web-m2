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

const userMocker = (token) => {
    if (token === UserService) {
        return { 
            getByPseudo: jest.fn().mockResolvedValue(expectedUser),
        }
    }
    
    if (token === JwtService) {
        return {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
        }
    }

    if (typeof token === 'function') {
        const mockMetadata = moduleMocker.getMetadata(token) as MockMetadata<any, any>;
        const Mock = moduleMocker.generateFromMetadata(mockMetadata) as ObjectConstructor;
        return new Mock();
    }
};

describe("UserController", () => {
    let userService: UserService;
    let userController: UserController;

    // Initialiser le module de test avant chaque test
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [UserController],
        })
        .useMocker(userMocker)
        .compile();
        
        userService = moduleRef.get(UserService);
        userController = moduleRef.get(UserController);
    });

    describe('getUserByPseudo', () => {
        it('should return a user when found', async () => {

            const pseudo = 'testuser';

            // Mock de l'objet response
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
});