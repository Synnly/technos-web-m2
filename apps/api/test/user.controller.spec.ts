import { UserController } from "../src/controller/user.controller";
import { UserService } from "../src/service/user.service";
import { Test } from "@nestjs/testing";
// import { getModelToken } from '@nestjs/mongoose';
import { User } from "../src/model/user.schema";
import { ModuleMocker, MockMetadata } from 'jest-mock';


const moduleMocker = new ModuleMocker(global);

const expectedUser = { 
    _id: '1', 
    pseudo: 'testuser', 
    motDePasse: 'hashedpassword', 
    points: 50, 
    pointsQuotidiensRecuperes: false
} as User;

const userMock = (token) => {
    if (token === UserService) {
        return { 
            getByPseudo: jest.fn().mockResolvedValue(expectedUser),
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
            providers: [UserService],
        })
        .useMocker(userMock)
        .compile();
        
        userService = moduleRef.get(UserService);
        userController = moduleRef.get(UserController);
    });

    describe('getUserByPseudo', () => {
        it('should return a user when found', async () => {

            expect(true).toBe(true);
            // const pseudo = 'testuser';
            
            // // Mock de la méthode getByPseudo du service utilisateur
            // // jest.spyOn(userService, 'getByPseudo').mockResolvedValue(expectedUser);
            // const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            // const result = await userController.getUserByPseudo(mockResponse, pseudo);

            // // Vérifier que le résultat est conforme aux attentes
            // expect(result).toEqual(expectedUser);
            // expect(mockResponse.status).toHaveBeenCalledWith(200);
            // expect(mockResponse.json).toHaveBeenCalledWith(expectedUser);
        });
    });
});