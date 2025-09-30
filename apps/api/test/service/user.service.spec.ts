import { UserController } from "../../src/controller/user.controller";
import { UserService } from "../../src/service/user.service";
import { JwtService } from '@nestjs/jwt';
import { Test } from "@nestjs/testing";
import { User } from "../../src/model/user.schema";
import { getModelToken } from '@nestjs/mongoose';
import { HttpStatus } from "@nestjs/common/enums/http-status.enum";

// Mock de bcrypt au niveau du module
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

const expectedUser1 = { 
    _id: '1', 
    username: 'testuser1', 
    motDePasse: 'hashedpassword', 
    points: 50, 
    pointsQuotidiensRecuperes: false,
    predictions : [],
    votes : [],
    role: 'user'
} as User;

const expectedUser2 = {
    _id: '2',
    username: 'testuser2',
    motDePasse: 'hashedpassword2',
    points: 30,
    pointsQuotidiensRecuperes: true,
    predictions : [],
    votes : [],
    role: 'user'
} as User;

const expectedUsers = [expectedUser1, expectedUser2];


// Définir le type pour le mock du UserModel
interface MockUserModel {
    new (data: any): {
        save: jest.Mock;
        [key: string]: any;
    };
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    findOneAndDelete: jest.Mock;
}

// Mock du UserModel avec le bon typage
const mockUserModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({
        _id: '3',
        ...data,
        points: 0,
        pointsQuotidiensRecuperes: false
    })
})) as unknown as MockUserModel;

// Ajouter les méthodes statiques
mockUserModel.findOne = jest.fn();
mockUserModel.find = jest.fn();
mockUserModel.create = jest.fn();
mockUserModel.findOneAndDelete = jest.fn();

// Mock du JwtService
const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;

describe("UserService", () => {
    let userService: UserService;

    // Initialiser le module de test avant chaque test
    beforeEach(async () => {
        jest.clearAllMocks();
        
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: UserService,
                    useClass: UserService,
                },
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                }
            ],
        })
        .compile();

        userService = moduleRef.get(UserService);
    });




    describe('getAll', () => {
        it('should return an array of users if users are found', async () => {
            mockUserModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUsers) });
            
            const result = await userService.getAll();
            
            expect(mockUserModel.find).toHaveBeenCalled();
            expect(result).toEqual(expectedUsers);
        });

        it('should return an empty array when no users found', async () => {
            mockUserModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
            
            const result = await userService.getAll();
            
            expect(mockUserModel.find).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });



    describe('getByUsername', () => {
        it('should return a user when found', async () => {
            const username = expectedUser1.username;

            mockUserModel.findOne.mockReturnValue({ 
                exec: jest.fn().mockResolvedValue(expectedUser1)
            });
            
            const result = await userService.getByUsername(username);
            
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
            expect(result).toEqual(expectedUser1);
        });

        it('should return undefined when user not found', async () => {
            const username = 'nonexistentuser';

            mockUserModel.findOne.mockReturnValue({ 
                exec: jest.fn().mockResolvedValue(null)
            });
            
            const result = await userService.getByUsername(username);
            
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
            expect(result).toBeUndefined();
        });
    });




    describe('createUser', () => {
        it('should create and return a new user when username is unique', async () => {
            const newUser = { 
                username: 'newuser', 
                motDePasse: 'plaintextpassword' 
            } as User;

            // Simuler l'absence d'utilisateur existant avec le même username
            mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

            mockBcryptHash.mockResolvedValue('hashedpassword');

            const result = await userService.createUser(newUser);
        
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: newUser.username });
            expect(mockUserModel).toHaveBeenCalledWith(expect.objectContaining({
                username: newUser.username,
                motDePasse: expect.any(String)
            }));
            expect(result).toEqual(expect.objectContaining({
                _id: '3',
                username: newUser.username,
                points: 0,
                pointsQuotidiensRecuperes: false
            }));
        });

        it('should throw an error when username already exists', async () => {
            const newUser = { 
                username: expectedUser1.username, 
                motDePasse: 'anotherpassword' 
            } as User;

            // Simuler la présence d'un utilisateur existant avec le même username
            mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });

            await expect(userService.createUser(newUser)).rejects.toEqual(
                expect.objectContaining({
                    message: 'Username déjà utilisé.',
                    status: HttpStatus.BAD_REQUEST
                })
            );
        
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: newUser.username });
            expect(mockUserModel).not.toHaveBeenCalled();
        });
    });




    describe('getJwtToken', () => {
        it('should return a JWT token for valid credentials', async () => {
            const username = expectedUser1.username;
            const role = expectedUser1.role;
            const motDePasse = 'plaintextpassword';
            
            mockUserModel.findOne.mockReturnValue({ 
                exec: jest.fn().mockResolvedValue(expectedUser1)
            });

            // Configurer bcrypt.compare pour retourner true
            mockBcryptCompare.mockResolvedValue(true);
            
            const result = await userService.getJwtToken(username, motDePasse, mockJwtService as unknown as JwtService);
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
            expect(mockJwtService.sign).toHaveBeenCalledWith({  role, username });
            expect(result).toEqual({ token: 'mock-jwt-token' });
        });

        it('should throw an error when user not found', async () => {
            const username = 'nonexistentuser';
            const motDePasse = 'somepassword';

            mockUserModel.findOne.mockReturnValue({ 
                exec: jest.fn().mockResolvedValue(null)
            });

            await expect(userService.getJwtToken(username, motDePasse, mockJwtService as unknown as JwtService)).rejects.toEqual(
                expect.objectContaining({
                    message: "L'utilisateur n'est pas trouvable",
                    status: HttpStatus.NOT_FOUND
                })
            );
        
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });

        it('should throw an error for incorrect password', async () => {
            const username = expectedUser1.username;
            const motDePasse = 'wrongpassword';

            mockUserModel.findOne.mockReturnValue({ 
                exec: jest.fn().mockResolvedValue(expectedUser1)
            });


            // Configurer bcrypt.compare pour retourner false
            mockBcryptCompare.mockResolvedValue(false);

            await expect(userService.getJwtToken(username, motDePasse, mockJwtService as unknown as JwtService)).rejects.toEqual(
                expect.objectContaining({
                    message: 'Identifiants incorrects.',
                    status: HttpStatus.UNAUTHORIZED
                })
            );
        
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
            expect(mockJwtService.sign).not.toHaveBeenCalled();
        });
    });




    describe('createOrUpdateByUsername', () => {
        it('should update and return an existing user', async () => {
            const username = expectedUser1.username;
            const updatedData = { 
                username: 'updateduser', 
                motDePasse: 'newpassword', 
                points: 100,
                pointsQuotidiensRecuperes: true
            } as User;

            // Simuler la présence d'un utilisateur existant avec le même username
            const existingUser = { 
                ...expectedUser1, 
                save: jest.fn().mockResolvedValue({
                    ...expectedUser1,
                    ...updatedData,
                    motDePasse: 'hashednewpassword' // Simuler le mot de passe hashé
                })
            };
            mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingUser) });

            mockBcryptHash.mockResolvedValue('hashednewpassword');

            const result = await userService.createOrUpdateByUsername(username, updatedData);
            
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
            expect(existingUser.save).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                ...expectedUser1,
                ...updatedData,
                motDePasse: 'hashednewpassword'
            }));
        });

        it('should create and return a new user when username does not exist', async () => {
            const username = 'newuser';
            const newUser = { 
                username: 'newuser', 
                motDePasse: 'plaintextpassword' 
            } as User;
            
            // Simuler l'absence d'utilisateur existant avec le même username
            mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

            mockBcryptHash.mockResolvedValue('hashedpassword');

            const result = await userService.createOrUpdateByUsername(username, newUser);
        
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
            expect(mockUserModel).toHaveBeenCalledWith(expect.objectContaining({
                username: newUser.username,
                motDePasse: expect.any(String)
            }));
            expect(result).toEqual(expect.objectContaining({
                _id: '3',
                username: newUser.username,
                points: 0,
                pointsQuotidiensRecuperes: false
            }));
        });
    });

    describe('deleteByUsername', () => {
        it('should delete and return the user when found', async () => {
            const username = expectedUser1.username;
            
            mockUserModel.findOneAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(expectedUser1) });

            const result = await userService.deleteByUsername(username);
            
            expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ username });
            expect(result).toEqual(expectedUser1);
        });

        it('should throw an error when user to delete is not found', async () => {
            const username = 'nonexistentuser';
            
            mockUserModel.findOneAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            
            await expect(userService.deleteByUsername(username)).rejects.toEqual(
                expect.objectContaining({
                    message: "L'utilisateur n'est pas trouvable",
                    status: HttpStatus.NOT_FOUND
                })
            );

            expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({ username });
        });
    });
});