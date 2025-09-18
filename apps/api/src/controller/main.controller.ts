import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/model/user.schema";
import { UserService } from "src/service/user.service";

/**
 * Contrôleur pour gérer les requêtes vers le point de terminaison 'main'.
 */
@Controller('main')
export class MainController {
    /**
     * Construit le MainController.
     * 
     * @param userService - Le service responsable des opérations liées aux utilisateurs.
     * @param jwtService - Le service responsable de la gestion des opérations JWT.
     */
    constructor(private readonly userService: UserService, private jwtService: JwtService) {}

    /**
     * Gère les requêtes GET vers le point de terminaison '/main'.
     * 
     * @param Response - L'objet de réponse HTTP.
     * @param user - Les données utilisateur fournies dans le corps de la requête.
     * @returns Une réponse JSON contenant l'utilisateur nouvellement créé.
     */
    @Get('/main')
    async hello(@Res() Response, @Body() user: User) {
        const newUser = await this.userService.signup(user)
        return Response.status(HttpStatus.CREATED).json(newUser)
    }
}