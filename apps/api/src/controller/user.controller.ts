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
     * Récupère un utilisateur par son pseudo.
     * @param response - L'objet de réponse HTTP.
     * @param pseudo - Le pseudo de l'utilisateur à récupérer.
     * @returns Les données de l'utilisateur avec le statut HTTP 200 si trouvé, sinon une erreur HTTP 400 (Bad Request) 
     * s'il n'y a pas de pseudo, ou une erreur HTTP 404 (Not Found) si l'utilisateur n'existe pas.
     */
    @Get('/{:pseudo}')
    async getUserByPseudo(@Res() response, @Param('pseudo') pseudo: string) {
        if (pseudo === undefined || pseudo === null) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le pseudo est requis' });
        }

        const user = await this.userService.getByPseudo(pseudo);
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
        if (!user.pseudo) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le pseudo est requis.' });

        // Validation des contraintes du mot de passe
            if (user.motDePasse.length < 8) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
            if (!/[A-Z]/.test(user.motDePasse)) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins une lettre majuscule.' });
            if (!/[a-z]/.test(user.motDePasse)) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins une lettre minuscule.' });
            if (!/[0-9]/.test(user.motDePasse)) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins un chiffre.' });
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(user.motDePasse)) return Response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe doit contenir au moins un caractère spécial.' });

        let newUser;
        try {
            newUser = await this.userService.createUser(user);
            return Response.status(HttpStatus.CREATED).json(newUser);
        } catch (error) {
            return Response.status(HttpStatus.BAD_REQUEST).json({ message : error.message });
        }
    }
    
    @Put('/{:id}')
    /**
     * Met à jour un utilisateur par son ID.
     *
     * @param response - L'objet de réponse HTTP.
     * @param id - L'ID de l'utilisateur à mettre à jour.
     * @param user - Les données de l'utilisateur à mettre à jour.
     * @returns Une réponse JSON contenant l'utilisateur mis à jour avec le statut HTTP 200 (Ok), ou un message d'erreur avec le
     * statut HTTP 400 (Bad Request) s'il n'y a pas d'utilisateur, de pseudo ni mot de passe.
     */
    async updateUserById(@Res() response, @Param('id') id: string, @Body() user: User) {
        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'id est requis' });
        if (isNaN(Number(id)) || Number(id) % 1 !== 0 || Number(id) < 0) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'id doit être un entier positif' });

        if (!user) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'utilisateur est requis' });

        let updatedUser;
        try{
            updatedUser = await this.userService.createOrUpdateById(id, user);
            return response.status(HttpStatus.OK).json(updatedUser);
        }
        catch (error) {
            return response.status(HttpStatus.BAD_REQUEST).json({ message : error.message });
        }
    }

    /**
     * Supprime un utilisateur par son identifiant.
     *
     * @param response - L'objet de réponse HTTP utilisé pour envoyer la réponse.
     * @param id - L'identifiant unique de l'utilisateur à supprimer.
     * @returns La réponse HTTP 200 (Ok) contenant l'utilisateur supprimé, sinon une erreur HTTP 400 (Bad Request) si
     * s'il n'y a pas d'id, ou une erreur HTTP 404 (Not Found) si l'utilisateur n'existe pas
     */
    @Delete('/delete/{:id}')
    async deleteUser(@Res() response, @Param('id') id : string) {
        if (!id) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'id est requis' });
        if (isNaN(Number(id)) || Number(id) % 1 !== 0 || Number(id) < 0) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'L\'id doit être un entier positif' });

        try{
            const deletedUser = await this.userService.deleteById(id);
            return response.status(HttpStatus.OK).json(deletedUser);
        } catch (error) {
            return response.status(HttpStatus.NOT_FOUND).json({ message : error.message });
        }
    }

    /**
     * Génère un token JWT pour un utilisateur donné.
     *
     * @param response - L'objet de réponse HTTP utilisé pour envoyer la réponse.
     * @param pseudo - Le pseudo de l'utilisateur pour lequel générer le token.
     * @returns La réponse HTTP contenant le token JWT si l'utilisateur est trouvé, ou un message d'erreur avec le 
     * statut HTTP 404 (Not Found) si l'utilisateur n'existe pas.
     */
    @Get('/{:pseudo}/token')
    async getJwtToken(@Res() response, @Param('pseudo') pseudo: string, @Body('password') password: string) {
        if (!pseudo) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le pseudo est requis' });
        if (!password) return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Le mot de passe est requis' });

        try{
            const token = await this.userService.getJwtToken(pseudo, password, this.jwtService);
            return response.status(HttpStatus.OK).json(token);
        } catch (error) {
            return response.status(error.status).json({ message : error.message });
        }
    }
}