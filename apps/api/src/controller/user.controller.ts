import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res } from "@nestjs/common";
import { User } from "../model/user.schema";
import { UserService } from "../service/user.service";
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
    constructor(private readonly userService: UserService, private jwtService: JwtService) {}

    /**
     * Récupère tous les utilisateurs
     * @param response - L'objet de réponse HTTP.
     * @returns La liste des utilisateurs avec le statut HTTP 200.
     */
    @Get('')
    async getUsers(@Res() response) {
        const user = await this.userService.getAll();
        return response.status(HttpStatus.OK).json(user);
    }

    /**
     * Récupère un utilisateur par son username.
     * @param response - L'objet de réponse HTTP.
     * @param username - Le nom d\'utilisateur de l'utilisateur à récupérer.
     * @returns Les données de l'utilisateur avec le statut HTTP 200 si trouvé, sinon une erreur HTTP 400 (Bad Request) 
     * s'il n'y a pas de username, ou une erreur HTTP 404 (Not Found) si l'utilisateur n'existe pas.
     */
    @Get('/{:username}')
    async getUserByUsername(@Res() response, @Param('username') username: string) {
        if (username === undefined || username === null) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le nom d\'utilisateur est requis' });
        }

        const user = await this.userService.getByUsername(username);
        if (!user) return response.status(HttpStatus.NOT_FOUND).json({ message: 'L\'utilisateur n\'est pas trouvable' });

        return response.status(HttpStatus.OK).json(user);
    }

    /**
     * Crée un nouvel utilisateur.
     * @param Response - L'objet de réponse HTTP.
     * @param user - Les données de l'utilisateur à créer.
     * @returns Les données du nouvel utilisateur avec le statut HTTP 201 (Created) si l'utilisateur est créé avec 
     * succès, sinon une erreur HTTP 400 (Bad Request) s'il n'y a pas d'utilisateur.
     */
    @Post('')
    async createUser(@Res() Response, @Body() user: User) {
        if (!user) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'utilisateur est requis' });

        // Validation des champs requis
        if (!user.motDePasse) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe est requis.' });
        if (!user.username) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le nom d\'utilisateur est requis.' });

        // Validation des contraintes du mot de passe
        if (user.motDePasse.length < 8) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
        if (!/[A-Z]/.test(user.motDePasse)) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins une lettre majuscule.' });
        if (!/[a-z]/.test(user.motDePasse)) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins une lettre minuscule.' });
        if (!/[0-9]/.test(user.motDePasse)) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins un chiffre.' });
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(user.motDePasse)) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins un caractère spécial.' });

        try {
            const newUser = await this.userService.createUser(user);
            return Response.status(HttpStatus.CREATED).json(newUser);
        } catch (error) {
            return Response.status(HttpStatus.BAD_REQUEST).json({ message : error.message });
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
    async updateUserByUsername(@Res() response, @Param('username') username: string, @Body() user: User) {
        if (!username) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le nom d\'utilisateur est requis' });
        if (!user) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'utilisateur est requis' });

        try{
            const updatedUser = await this.userService.createOrUpdateByUsername(username, user);
            return response.status(HttpStatus.OK).json(updatedUser);
        }
        catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message : error.message });
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
    async deleteUser(@Res() response, @Param('username') username : string) {
        if (!username) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le nom d\'utilisateur est requis' });

        try{
            const deletedUser = await this.userService.deleteByUsername(username);
            return response.status(HttpStatus.OK).json(deletedUser);
        } catch (error) {
            return response.status(HttpStatus.NOT_FOUND).json({ message : error.message });
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
    async login(@Res() response, @Body() credentials: { username: string; password: string }) {
        if (!credentials.username) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le nom d\'utilisateur est requis' });
        if (!credentials.password) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe est requis' });

        try {
            const token = await this.userService.getJwtToken(credentials.username, credentials.password, this.jwtService);
            return response.status(HttpStatus.OK).json({ token: token});
        } catch (error) {
            return response.status(error.status || HttpStatus.UNAUTHORIZED).json({ 
                message: error.message || 'Échec de l\'authentification' 
            });
        }
    }
}