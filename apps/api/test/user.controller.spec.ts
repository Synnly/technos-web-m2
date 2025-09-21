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
    motDePasse: 'H@sh3dpassword', 
    points: 50, 
    pointsQuotidiensRecuperes: false
} as User;

const expectedUser2 = { 
    _id: '2', 
    pseudo: 'testuser2', 
    motDePasse: 'H@sh3dpassword2', 
    points: 100, 
    pointsQuotidiensRecuperes: true
} as User;

const expectedUsers = [expectedUser1, expectedUser2];

const mockUserService = {
    getAll: jest.fn(),
    getByPseudo: jest.fn(),
    createUser: jest.fn(),
    createOrUpdateById : jest.fn(),
    deleteById : jest.fn(),
    getJwtToken : jest.fn()
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
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'utilisateur n\'est pas trouvable' });
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
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'utilisateur n\'est pas trouvable' });
        });
    });

    



    describe('createUser', () => {
        it('should return a 201 when a user is created', async () => {
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createUser.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, expectedUser1);

            // Vérifier que le service a été appelé correctement
            expect(userService.createUser).toHaveBeenCalledWith(expectedUser1);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the user already exists', async () => {
            // Configuration du mock pour lancer une exception
            mockUserService.createUser.mockImplementation(() => {
                throw new HttpException('Pseudo déjà utilisé.', HttpStatus.BAD_REQUEST);
            });

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, expectedUser1);

            // Vérifier que le service a été appelé correctement
            expect(userService.createUser).toHaveBeenCalledWith(expectedUser1);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Pseudo déjà utilisé.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the user doesn\'t have a password', async () => {
            const pseudo = 'testuser';
            const newUser = {pseudo: pseudo} as User;
        

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, newUser);
            
            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le mot de passe est requis.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the user doesn\'t have a pseudo', async () => {
            const motDePasse = 'testpassword';
            const newUser = {motDePasse: motDePasse} as User;

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, newUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le pseudo est requis.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the password is too short', async () => {
            const newUser = {
                pseudo: 'testuser',
                motDePasse: 'Short1!'
            } as User;

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, newUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le mot de passe doit contenir au moins 8 caractères.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the password doesn\'t contain an uppercase letter', async () => {
            const newUser = {
                pseudo: 'testuser',
                motDePasse: 'lowercase123!'
            } as User;

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, newUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le mot de passe doit contenir au moins une lettre majuscule.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the password doesn\'t contain a lowercase letter', async () => {
            const newUser = {
                pseudo: 'testuser',
                motDePasse: 'UPPERCASE123!'
            } as User;

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, newUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le mot de passe doit contenir au moins une lettre minuscule.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the password doesn\'t contain a digit', async () => {
            const newUser = {
                pseudo: 'testuser',
                motDePasse: 'NoDigits!'
            } as User;

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, newUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le mot de passe doit contenir au moins un chiffre.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the password doesn\'t contain a special character', async () => {
            const newUser = {
                pseudo: 'testuser',
                motDePasse: 'NoSpecial123'
            } as User;

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, newUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le mot de passe doit contenir au moins un caractère spécial.'});
        });
    });




    describe('updateUserById', () => {
        it('should return a 200 when a user is updated', async () => {
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateById.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", expectedUser1);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateById).toHaveBeenCalledWith("1", expectedUser1);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('updateUserById', () => {
        it('should return a 200 when a user\'s pseudo is updated', async () => {
            const updatedUser = {...expectedUser1, pseudo: 'updatedPseudo'} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateById.mockResolvedValue(updatedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateById).toHaveBeenCalledWith("1", updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('updateUserById', () => {
        it('should return a 200 when a user\'s password is updated', async () => {
            const updatedUser = {...expectedUser1, motDePasse: 'updatedMotDePasse'} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateById.mockResolvedValue(updatedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateById).toHaveBeenCalledWith("1", updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('updateUserById', () => {
        it('should return a 200 when a user\'s points is updated', async () => {
            const updatedUser = {...expectedUser1, points: 200} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateById.mockResolvedValue(updatedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateById).toHaveBeenCalledWith("1", updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('updateUserById', () => {
        it('should return a 200 when a user\'s pointsQuotidiensRecuperes is updated', async () => {
            const updatedUser = {...expectedUser1, pointsQuotidiensRecuperes: true} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateById.mockResolvedValue(updatedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateById).toHaveBeenCalledWith("1", updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('updateUserById', () => {
        it('should return a 200 when a user is updated to the same user', async () => {
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateById.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", expectedUser1);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateById).toHaveBeenCalledWith("1", expectedUser1);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('updateUserById', () => {
        it('should return a 200 if the user doesn\'t have a password', async () => {
            const pseudo = 'testuser';
            const noPasswordUser = {pseudo: pseudo} as User;
            

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", noPasswordUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateById).toHaveBeenCalledWith("1", noPasswordUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('updateUserById', () => {
        it('should return a 200 if the user doesn\'t have a pseudo', async () => {
            const motDePasse = 'testpassword';
            const noPseudoUser = {motDePasse: motDePasse} as User;
        
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", noPseudoUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('updateUserById', () => {
        it('should return a 200 when a user is updated with empty object', async () => {
            const updatedUser = {} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateById.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.updateUserById(mockResponse, "1", updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateById).toHaveBeenCalledWith("1", updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });




    describe('deleteUser', () => {
        it('should delete the user when given a valid user', async () => {
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

    describe('deleteUser', () => {
        it('should return a 404 when the user doesn\'t exist', async () => {
            const userId = '3';

            // Configuration du mock pour lancer une exception
            mockUserService.deleteById.mockImplementation(() => {
                throw new HttpException('L\'utilisateur n\'est pas trouvable', HttpStatus.NOT_FOUND);
            });
            
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, userId);

            // Vérifier que le service a été appelé correctement
            expect(userService.deleteById).toHaveBeenCalledWith(userId);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'L\'utilisateur n\'est pas trouvable'});
        });
    });

    describe('deleteUser', () => {
        it('should return a 400 when no id is given', async () => {
            const userId = "";
        
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, userId);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'id est requis' });
        });
    });

    describe('deleteUser', () => {
        it('should return a 400 when the id is not a number', async () => {
            const userId = "notANumber";

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, userId);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'id doit être un entier positif' });
        });
    });

    describe('deleteUser', () => {
        it('should return a 400 when the id is not an integer', async () => {
            const userId = "6.9";

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, userId);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'id doit être un entier positif' });
        });
    });

    describe('deleteUser', () => {
        it('should return a 400 when the id is not a positive integer', async () => {
            const userId = "-2";

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, userId);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'id doit être un entier positif' });
        });
    });




    describe('getJwtToken', () => {
        it('should return the token when given a valid user', async () => {
            const token = "token";

            // Configuration du mock pour retourner l'utilisateur attendu
            mockUserService.getJwtToken.mockResolvedValue(token);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.login(mockResponse, {pseudo : expectedUser1.pseudo, password: expectedUser1.motDePasse});

            // Vérifier que le service a été appelé correctement
            expect(userService.getJwtToken).toHaveBeenCalledWith(expectedUser1.pseudo,  expectedUser1.motDePasse, mockJwtService);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({token: token});
        });
    });

    describe('getJwtToken', () => {
        it('should return  a 400 when no pseudo is given', async () => {
            const token = "token";

            // Configuration du mock pour lancer une exception
            mockUserService.getJwtToken.mockImplementation(() => {
                throw new HttpException('Le pseudo est requis', HttpStatus.BAD_REQUEST);
            });

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.login(mockResponse, {pseudo: "", password: expectedUser1.motDePasse});

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le pseudo est requis'});
        });
    });

    describe('getJwtToken', () => {
        it('should return  a 400 when no password is given', async () => {
            const token = "token";

            // Configuration du mock pour lancer une exception
            mockUserService.getJwtToken.mockImplementation(() => {
                throw new HttpException('Le mot de passe est requis', HttpStatus.BAD_REQUEST);
            });


            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.login(mockResponse, {pseudo: expectedUser1.pseudo, password: ""});

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le mot de passe est requis'});
        });
    });

    describe('getJwtToken', () => {
        it('should return  a 403 when a unknown pseudo is given', async () => {
            const token = "token";

            // Configuration du mock pour lancer une exception
            mockUserService.getJwtToken.mockImplementation(() => {
                throw new HttpException('Identifiants incorrects.', HttpStatus.UNAUTHORIZED);
            });

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.login(mockResponse, { pseudo: "unkonwnUser", password: expectedUser1.motDePasse});

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Identifiants incorrects.'});
        });
    });

    describe('getJwtToken', () => {
        it('should return  a 403 when the wrong password is given', async () => {
            const token = "token";

            // Configuration du mock pour lancer une exception
            mockUserService.getJwtToken.mockImplementation(() => {
                throw new HttpException('Identifiants incorrects.', HttpStatus.UNAUTHORIZED);
            });

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.login(mockResponse, {pseudo: expectedUser1.pseudo, password: "wrongPassword"});

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Identifiants incorrects.'});
        });
    });
})