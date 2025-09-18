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
     * Récupère un utilisateur par son pseudo.
     * @param response - L'objet de réponse HTTP.
     * @param pseudo - Le pseudo de l'utilisateur à récupérer.
     * @returns Les données de l'utilisateur avec le statut HTTP 200.
     */
    @Get('/{:pseudo}')
    async getUser(@Res() response, @Param('pseudo') pseudo: string) {
        const user = await this.userService.getOne(pseudo);
        return response.status(HttpStatus.OK).json(user);
    }

    /**
     * Inscrit un nouvel utilisateur.
     * @param Response - L'objet de réponse HTTP.
     * @param user - Les données de l'utilisateur à créer.
     * @returns Les données de l'utilisateur créé avec le statut HTTP 201.
     */
    @Post('/signup')
    async Signup(@Res() Response, @Body() user: User) {
        const newUser = await this.userService.signup(user);
        return Response.status(HttpStatus.CREATED).json(newUser);
    }

    /**
     * Connecte un utilisateur existant.
     * @param response - L'objet de réponse HTTP.
     * @param user - Les informations d'identification de l'utilisateur pour la connexion.
     * @returns Un token JWT avec le statut HTTP 200.
     */
    @Post('/signin')
    async SignIn(@Res() response, @Body() user: User) {
        const token = await this.userService.signin(user, this.jwtService);
        return response.status(HttpStatus.OK).json(token);
    }
}