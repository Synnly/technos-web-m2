import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UnauthorizedException } from "@nestjs/common";
import { Role, User } from "../user/user.schema";
import { UserService } from "./user.service";
import { JwtService } from '@nestjs/jwt'

/**
 * Contrôleur pour gérer les opérations liées aux utilisateurs.
 */
@Controller('/api/user')
export class UserController {
    
    /**
     * Constructeur pour UserController.
     * @param userService - Service pour la logique métier liée aux utilisateurs.
     * @param jwtService - Service pour gérer les opérations JWT.
     */
    constructor(private readonly userService: UserService, private jwtService: JwtService) {
    }

    /**
     * Récupère tous les utilisateurs
     * @param response - L'objet de réponse HTTP.
     * @returns La liste des utilisateurs avec le statut HTTP 200.
     */
    @Get('')
    async getUsers() {
        const user = await this.userService.getAll();
        return user;
    }

    /**
     * Récupère un utilisateur par son username.
     * @param response - L'objet de réponse HTTP.
     * @param username - Le nom d\'utilisateur de l'utilisateur à récupérer.
     * @returns Les données de l'utilisateur avec le statut HTTP 200 si trouvé, sinon une erreur HTTP 400 (Bad Request) 
     * s'il n'y a pas de username, ou une erreur HTTP 404 (Not Found) si l'utilisateur n'existe pas.
     */
    @Get('/{:username}')
    async getUserByUsername(@Param('username') username: string) {
        if (username === undefined || username === null) {
            throw new BadRequestException({ message: 'Le nom d\'utilisateur est requis' });
        }

        const user = await this.userService.getByUsername(username);
        if (!user) throw new NotFoundException({ message: 'L\'utilisateur n\'est pas trouvable' });

        return user;
    }

    /**
     * Crée un nouvel utilisateur.
     * @param Response - L'objet de réponse HTTP.
     * @param user - Les données de l'utilisateur à créer.
     * @returns Les données du nouvel utilisateur avec le statut HTTP 201 (Created) si l'utilisateur est créé avec 
     * succès, sinon une erreur HTTP 400 (Bad Request) s'il n'y a pas d'utilisateur, si les champs requis sont manquants, 
     * si les contraintes du mot de passe ne sont pas respectées, ou si le nom d'utilisateur est déjà utilisé.
     */
    @Post('')
    @HttpCode(201)
    async createUser(@Body() user: User) {
        if (!user) throw new BadRequestException({ message: 'L\'utilisateur est requis' });

        // Validation des champs requis
        if (!user.motDePasse) throw new BadRequestException({ message: 'Le mot de passe est requis.' });
        if (!user.username) throw new BadRequestException({ message: 'Le nom d\'utilisateur est requis.' });

        // Validation des contraintes du mot de passe
        if (user.motDePasse.length < 8) throw new BadRequestException({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
        if (!/[A-Z]/.test(user.motDePasse)) throw new BadRequestException({ message: 'Le mot de passe doit contenir au moins une lettre majuscule.' });
        if (!/[a-z]/.test(user.motDePasse)) throw new BadRequestException({ message: 'Le mot de passe doit contenir au moins une lettre minuscule.' });
        if (!/[0-9]/.test(user.motDePasse)) throw new BadRequestException({ message: 'Le mot de passe doit contenir au moins un chiffre.' });
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(user.motDePasse)) throw new BadRequestException({ message: 'Le mot de passe doit contenir au moins un caractère spécial.' });
        try {
            const newUser = await this.userService.createUser({...user, role: Role.USER});
            return newUser;
        } catch (error) {
            throw new BadRequestException({ message : error.message });
        }
    }
    
    /**
     * Met à jour un utilisateur par son username.
     * @param response - L'objet de réponse HTTP.
     * @param username - Le nom d\'utilisateur de l'utilisateur à mettre à jour.
     * @param user - Les nouvelles données de l'utilisateur.
     * @returns Les données de l'utilisateur mis à jour avec le statut HTTP 200 (Ok) si trouvé, sinon une erreur HTTP 404 
     * (Not Found) si l'utilisateur n'existe pas, ou une erreur HTTP 400 (Bad Request) s'il n'y a pas de username ou 
     * d'utilisateur.
     */
    @Put('/{:username}')
    async updateUserByUsername(@Req() request, @Param('username') username: string, @Body() user: User) {
        if (!username) throw new BadRequestException({ message: 'Le nom d\'utilisateur est requis' });
        if (!user) throw new BadRequestException({ message: 'L\'utilisateur est requis' });

        if (request.user.role !== Role.ADMIN && request.user.username !== username) {
            throw new ForbiddenException({ message: 'Vous n\'avez pas la permission de modifier cet utilisateur.' });
        }

        try{
            const updatedUser = await this.userService.createOrUpdateByUsername(username, user);
            return updatedUser;
        }
        catch (error) {
            throw new BadRequestException({ message : error.message });
        }
    }

    /**
     * Supprime un utilisateur par son username.
     * @param response - L'objet de réponse HTTP.
     * @param username - Le nom d\'utilisateur de l'utilisateur à supprimer.
     * @returns Les données de l'utilisateur supprimé avec le statut HTTP 200 (Ok) si trouvé, sinon une erreur HTTP 404 
     * (Not Found) si l'utilisateur n'existe pas ou une erreur HTTP 400 (Bad Request) s'il n'y a pas de username.
     */
    @Delete('/{:username}')
    async deleteUser(@Param('username') username : string) {
        if (!username) throw new BadRequestException({ message: 'Le nom d\'utilisateur est requis' });

        try{
            const deletedUser = await this.userService.deleteByUsername(username);
            return deletedUser;
        } catch (error) {
            throw new NotFoundException({ message : error.message });
        }
    }

    /**
     * Authentifie un utilisateur et génère un token JWT.
     * @param response - L'objet de réponse HTTP utilisé pour envoyer la réponse.
     * @param credentials - Les identifiants de connexion (username et mot de passe).
     * @returns La réponse HTTP contenant le token JWT si l'authentification réussit, ou un message d'erreur avec le 
     * statut HTTP approprié.
     */
    @Post('/login')
    async login(@Body() credentials: { username: string; password: string }) {
        if (!credentials.username) throw new BadRequestException({ message: 'Le nom d\'utilisateur est requis' });
        if (!credentials.password) throw new BadRequestException({ message: 'Le mot de passe est requis' });

        try {
            const token = await this.userService.getJwtToken(credentials.username, credentials.password, this.jwtService);
            return { token: token};
        } catch (error) {
            throw new UnauthorizedException({ 
                message: error.message || 'Échec de l\'authentification' 
            });
        }
    }

    /**
     * Récupère la récompense quotidienne pour un utilisateur donné.
     * @param username Le nom d'utilisateur de l'utilisateur qui réclame la récompense quotidienne.
     * @param response L'objet de réponse HTTP utilisé pour envoyer la réponse.
     * @returns La réponse HTTP contenant la récompense quotidienne si l'utilisateur est trouvé, ou une erreur HTTP
     * 400 (Bad Request) si le nom d'utilisateur est manquant ou une erreur HTTP 404 (Not Found) si l'utilisateur n'existe pas.
     */
    @Get('/{:username}/daily-reward')
    async getDailyReward(@Param('username') username : string, ) {
        if (!username) throw new BadRequestException({ message: 'Le nom d\'utilisateur est requis' });

        try {
            const reward = await this.userService.claimDailyReward(username);
            return { reward: reward };
        } catch (error) {
            throw new BadRequestException({ 
                message: error.message || 'Échec de la récupération de la récompense quotidienne' 
            });
        }
    }   
}