import { JwtService } from "@nestjs/jwt";
import {
	Injectable,
	NestMiddleware,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { UserService } from "./user/user.service";

interface UserRequest extends Request {
	user: any;
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié via un token JWT.
 */
@Injectable()
export class isAuthenticated implements NestMiddleware {
	constructor(
		private readonly jwt: JwtService,
		private readonly userService: UserService,
	) {}

	/**
	 * Vérifie l'authentification de l'utilisateur à chaque requête.
	 * Si le token JWT est valide, l'utilisateur est attaché à la requête.
	 * @param req La requête entrante.
	 * @param res La réponse sortante.
	 * @param next La fonction pour passer au middleware suivant.
	 * @throws {HttpException} Si le token est manquant ou invalide.
	 */
	async use(req: UserRequest, res: Response, next: NextFunction) {
		try {
			if (
				req.headers.authorization &&
				req.headers.authorization.startsWith("Bearer")
			) {
				// Extraction de l'utilisateur à partir du token dans l'en-tête Authorization
				const token = req.headers.authorization.split(" ")[1];
				const decoded = await this.jwt.verify(token);
				const user = await this.userService.getByUsername(
					decoded.username,
				);

				if (user) {
					req.user = user;
					next();
				} else {
					throw new HttpException(
						"Non autorisé",
						HttpStatus.UNAUTHORIZED,
					);
				}
			} else {
				throw new HttpException(
					"Aucun token trouvé",
					HttpStatus.NOT_FOUND,
				);
			}
		} catch {
			throw new HttpException("Non autorisé", HttpStatus.UNAUTHORIZED);
		}
	}
}
