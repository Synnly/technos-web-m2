import {
	Body,
	Controller,
	HttpStatus,
	Post,
	Res,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

/**
 * Contrôleur pour gérer les requêtes vers le point de terminaison 'token'.
 */
@Controller("/api/token")
export class TokenController {
	/**
	 * Construit le TokenController.
	 *
	 * @param userService - Le service responsable des opérations liées aux utilisateurs.
	 * @param jwtService - Le service responsable de la gestion des opérations JWT.
	 */
	constructor(private jwtService: JwtService) {}

	/**
	 * Vérifie la validité d'un token JWT.
	 * @param response L'objet de réponse HTTP.
	 * @param token Le token JWT à vérifier.
	 * @returns Une réponse HTTP 200 (Ok) avec les données décodées si le token est valide, sinon une réponse HTTP 401
	 * (Unauthorized) avec un message d'erreur.
	 */
	@Post("/check")
	async checkToken(
		@Res() response,
		@Body("token") token: string,
	): Promise<any> {
		try {
			const decoded = this.jwtService.verify(token);
			return response.status(HttpStatus.OK).json(decoded);
		} catch (_) {
			throw new UnauthorizedException("Invalid token");
		}
	}
}