import { UserController } from "../../src/controller/user.controller";
import { UserService } from "../../src/service/user.service";
import { Test } from "@nestjs/testing";
import { Role, User } from "../../src/model/user.schema";
import { JwtService } from '@nestjs/jwt';
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { HttpStatus } from "@nestjs/common/enums/http-status.enum";

const expectedUser1 = { 
    _id: '1', 
    username: 'testuser1', 
    motDePasse: 'H@sh3dpassword', 
    points: 50, 
    pointsQuotidiensRecuperes: false,
    predictions : [],
    votes : [],
    role: 'user'
} as User;

const expectedUser2 = { 
    _id: '2', 
    username: 'testuser2', 
    motDePasse: 'H@sh3dpassword2', 
    points: 100, 
    pointsQuotidiensRecuperes: true,
    predictions : [],
    votes : [],
    role: 'user'
} as User;

const expectedUsers = [expectedUser1, expectedUser2];

const mockUserService = {
    getAll: jest.fn(),
    getByUsername: jest.fn(),
    createUser: jest.fn(),
    createOrUpdateByUsername : jest.fn(),
    deleteByUsername : jest.fn(),
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





    describe('getUserByUsername', () => {
        it('should return a user when found', async () => {
            const username = 'testuser';

            // Configuration du mock pour retourner l'utilisateur attendu
            mockUserService.getByUsername.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUserByUsername(mockResponse, username);

            // Vérifier que le service a été appelé correctement
            expect(userService.getByUsername).toHaveBeenCalledWith(username);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('getUserByUsername', () => {
        it('should return 404 when user is not found by correct username', async () => {
            const username = 'unknownuser';
            
            // Configuration du mock pour retourner null (utilisateur non trouvé)
            mockUserService.getByUsername.mockResolvedValue(null);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUserByUsername(mockResponse, username);

            // Vérifier que le service a été appelé correctement
            expect(userService.getByUsername).toHaveBeenCalledWith(username);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'L\'utilisateur n\'est pas trouvable' });
        });
    });

    describe('getUserByUsername', () => {
        it('should return 404 when user is not found by empty username', async () => {
            const username = '';
            
            // Configuration du mock pour retourner null (utilisateur non trouvé)
            mockUserService.getByUsername.mockResolvedValue(null);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.getUserByUsername(mockResponse, username);

            // Vérifier que le service a été appelé correctement
            expect(userService.getByUsername).toHaveBeenCalledWith(username);

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
                throw new HttpException('Username déjà utilisé.', HttpStatus.BAD_REQUEST);
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
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Username déjà utilisé.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the user doesn\'t have a password', async () => {
            const username = 'testuser';
            const newUser = {username: username} as User;
        

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
        it('should return a 400 if the user doesn\'t have a username', async () => {
            const motDePasse = 'testpassword';
            const newUser = {motDePasse: motDePasse} as User;

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.createUser(mockResponse, newUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le nom d\'utilisateur est requis.'});
        });
    });

    describe('createUser', () => {
        it('should return a 400 if the password is too short', async () => {
            const newUser = {
                username: 'testuser',
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
                username: 'testuser',
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
                username: 'testuser',
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
                username: 'testuser',
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
                username: 'testuser',
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




    describe('updateUserByUsername', () => {
        it('should return a 200 when a user is updated', async () => {
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateByUsername.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };
            
            const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;

            // Utiliser le même username que dans mockReq.user.username pour passer la vérification de permission
            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, expectedUser1);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateByUsername).toHaveBeenCalledWith(expectedUser1.username, expectedUser1);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('updateUserByUsername', () => {
        it('should return a 200 when a user\'s username is updated', async () => {
            const updatedUser = {...expectedUser1, username: 'updatedUsername'} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateByUsername.mockResolvedValue(updatedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

             const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;
            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateByUsername).toHaveBeenCalledWith(expectedUser1.username, updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('updateUserByUsername', () => {
        it('should return a 200 when a user\'s password is updated', async () => {
            const updatedUser = {...expectedUser1, motDePasse: 'updatedMotDePasse'} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateByUsername.mockResolvedValue(updatedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

             const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;

            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateByUsername).toHaveBeenCalledWith(expectedUser1.username, updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('updateUserByUsername', () => {
        it('should return a 200 when a user\'s points is updated', async () => {
            const updatedUser = {...expectedUser1, points: 200} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateByUsername.mockResolvedValue(updatedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

             const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;

            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateByUsername).toHaveBeenCalledWith(expectedUser1.username, updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('updateUserByUsername', () => {
        it('should return a 200 when a user\'s pointsQuotidiensRecuperes is updated', async () => {
            const updatedUser = {...expectedUser1, pointsQuotidiensRecuperes: true} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateByUsername.mockResolvedValue(updatedUser);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

             const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;

            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateByUsername).toHaveBeenCalledWith(expectedUser1.username, updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
        });
    });

    describe('updateUserByUsername', () => {
        it('should return a 200 when a user is updated to the same user', async () => {
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateByUsername.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

             const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;
            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, expectedUser1);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateByUsername).toHaveBeenCalledWith(expectedUser1.username, expectedUser1);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('updateUserByUsername', () => {
        it('should return a 200 if the user doesn\'t have a password', async () => {
            const username = 'testuser';
            const noPasswordUser = {username: username} as User;
            

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

             const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;

            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, noPasswordUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateByUsername).toHaveBeenCalledWith(expectedUser1.username, noPasswordUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('updateUserByUsername', () => {
        it('should return a 200 if the user doesn\'t have a username', async () => {
            const motDePasse = 'testpassword';
            const noUsernameUser = {motDePasse: motDePasse} as User;
        
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

             const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;

            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, noUsernameUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('updateUserByUsername', () => {
        it('should return a 200 when a user is updated with empty object', async () => {
            const updatedUser = {} as User;
            
            // Configuration du mock pour retourner l'utilisateur créé
            mockUserService.createOrUpdateByUsername.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

             const mockReq = { 
                user: {
                    _id: (expectedUser1 as any)._id,
                    role: expectedUser1.role,
                    username: expectedUser1.username
                }
            } as any;

            await userController.updateUserByUsername(mockReq, mockResponse, expectedUser1.username, updatedUser);

            // Vérifier que le service a été appelé correctement
            expect(userService.createOrUpdateByUsername).toHaveBeenCalledWith(expectedUser1.username, updatedUser);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });




    describe('deleteUser', () => {
        it('should delete the user when given a valid user', async () => {
            const username = expectedUser1.username;
            
            // Configuration du mock pour retourner l'utilisateur attendu
            mockUserService.deleteByUsername.mockResolvedValue(expectedUser1);

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, username);

            // Vérifier que le service a été appelé correctement
            expect(userService.deleteByUsername).toHaveBeenCalledWith(username);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expectedUser1);
        });
    });

    describe('deleteUser', () => {
        it('should return a 404 when the user doesn\'t exist', async () => {
            const username = 'wrongUsername';

            // Configuration du mock pour lancer une exception
            mockUserService.deleteByUsername.mockImplementation(() => {
                throw new HttpException('L\'utilisateur n\'est pas trouvable', HttpStatus.NOT_FOUND);
            });
            
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, username);

            // Vérifier que le service a été appelé correctement
            expect(userService.deleteByUsername).toHaveBeenCalledWith(username);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'L\'utilisateur n\'est pas trouvable'});
        });
    });

    describe('deleteUser', () => {
        it('should return a 400 when no username is given', async () => {
            const username = "";
        
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.deleteUser(mockResponse, username);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Le nom d\'utilisateur est requis' });
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

            await userController.login(mockResponse, {username : expectedUser1.username, password: expectedUser1.motDePasse});

            // Vérifier que le service a été appelé correctement
            expect(userService.getJwtToken).toHaveBeenCalledWith(expectedUser1.username,  expectedUser1.motDePasse, mockJwtService);

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({token: token});
        });
    });

    describe('getJwtToken', () => {
        it('should return  a 400 when no username is given', async () => {
            const token = "token";

            // Configuration du mock pour lancer une exception
            mockUserService.getJwtToken.mockImplementation(() => {
                throw new HttpException('Le nom d\'utilisateur est requis', HttpStatus.BAD_REQUEST);
            });

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.login(mockResponse, {username: "", password: expectedUser1.motDePasse});

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le nom d\'utilisateur est requis'});
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

            await userController.login(mockResponse, {username: expectedUser1.username, password: ""});

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Le mot de passe est requis'});
        });
    });

    describe('getJwtToken', () => {
        it('should return  a 403 when a unknown username is given', async () => {
            const token = "token";

            // Configuration du mock pour lancer une exception
            mockUserService.getJwtToken.mockImplementation(() => {
                throw new HttpException('Identifiants incorrects.', HttpStatus.UNAUTHORIZED);
            });

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await userController.login(mockResponse, { username: "unkonwnUser", password: expectedUser1.motDePasse});

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

            await userController.login(mockResponse, {username: expectedUser1.username, password: "wrongPassword"});

            // Vérifier que les méthodes du mock de response ont été appelées correctement
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({message : 'Identifiants incorrects.'});
        });
    });
})