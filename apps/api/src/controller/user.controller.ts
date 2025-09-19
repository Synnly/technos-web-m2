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
     * @returns Les données de l'utilisateur avec le statut HTTP 200.
     */
    @Get('/{:pseudo}')
    async getUserByPseudo(@Res() response, @Param('pseudo') pseudo: string) {
        const user = await this.userService.getByPseudo(pseudo);
        if (!user) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        return response.status(HttpStatus.OK).json(user);
    }

    /**
     * Crée un nouvel utilisateur.
     * @param Response - L'objet de réponse HTTP.
     * @param user - Les données de l'utilisateur à créer.
     * @returns Les données du nouvel utilisateur avec le statut HTTP 201 (Created) si l'utilisateur est créé avec 
     * succès, sinon une erreur HTTP 400 (Bad Request).
     */
    @Post('')
    async createUser(@Res() Response, @Body() user: User) {
        const newUser = await this.userService.createUser(user);
        return Response.status(HttpStatus.CREATED).json(newUser);
    }
    
    @Put('/{:id}')
    /**
     * Met à jour un utilisateur par son ID.
     *
     * @param response - L'objet de réponse HTTP.
     * @param id - L'ID de l'utilisateur à mettre à jour.
     * @param user - Les données de l'utilisateur à mettre à jour.
     * @returns Une réponse JSON contenant l'utilisateur mis à jour avec le statut HTTP 200.
     */
    async updateUserById(@Res() response, @Param('id') id: string, @Body() user: User) {
        const updatedUser = await this.userService.createOrUpdateById(id, user);
        return response.status(HttpStatus.OK).json(updatedUser);
    }

    /**
     * Supprime un utilisateur par son identifiant.
     *
     * @param response - L'objet de réponse HTTP utilisé pour envoyer la réponse.
     * @param id - L'identifiant unique de l'utilisateur à supprimer.
     * @returns La réponse HTTP contenant l'utilisateur supprimé.
     *
     * @remarks
     * Cette méthode appelle le service utilisateur pour supprimer l'utilisateur correspondant à l'identifiant fourni,
     * puis retourne le résultat avec un statut HTTP 200 (OK).
     */
    @Delete('/delete/{:id}')
    async deleteUser(@Res() response, @Param('id') id : string) {
        const deletedUser = await this.userService.deleteById(id);
        return response.status(HttpStatus.OK).json(deletedUser);
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
    async getJwtToken(@Res() response, @Param('pseudo') pseudo: string) {
        const user = await this.userService.getByPseudo(pseudo);
        if (!user) {
            return response.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
        }

        const token = await this.userService.getJwtToken(user, this.jwtService);
        return response.status(HttpStatus.OK).json(token);
    }
}