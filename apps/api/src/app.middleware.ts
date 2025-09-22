import { JwtService } from '@nestjs/jwt';
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserService } from './service/user.service';

interface UserRequest extends Request {
	user: any
}

/**
 * Middleware pour vérifier si un utilisateur est authentifié.
 * 
 * Ce middleware vérifie la présence d'un token Bearer dans l'en-tête Authorization,
 * décode le token pour extraire les informations de l'utilisateur, et récupère l'utilisateur
 * correspondant depuis la base de données. Si l'utilisateur est trouvé, il l'attache à l'objet
 * de la requête et permet à la requête de continuer. Sinon, il lève une exception HTTP appropriée.
 * 
 * @class isAuthenticated
 * @implements {NestMiddleware}
 * 
 * @constructor
 * @param {JwtService} jwt - Service pour vérifier et décoder les tokens JWT.
 * @param {UserService} userService - Service pour récupérer les informations de l'utilisateur depuis la base de données.
 * 
 * @method use
 * @async
 * @param {UserRequest} req - L'objet de requête entrant, étendu pour inclure une propriété `user`.
 * @param {Response} res - L'objet de réponse sortant.
 * @param {NextFunction} next - La fonction middleware suivante dans le cycle requête-réponse.
 * 
 * @throws {HttpException} Si l'en-tête Authorization est manquant ou invalide, ou si l'utilisateur n'est pas trouvé.
 */
@Injectable()
export class isAuthenticated implements NestMiddleware {
	constructor(private readonly jwt: JwtService, private readonly userService: UserService) { }

	async use(req: UserRequest, res: Response, next: NextFunction) {
		try{
			if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
				// Extraction de l'utilisateur à partir du token dans l'en-tête Authorization
				const token = req.headers.authorization.split(' ')[1];
				const decoded = await this.jwt.verify(token);
				const user = await this.userService.getByPseudo(decoded.username)

				if (user) {
					req.user = user
					next()
				} else {
					throw new HttpException('Non autorisé', HttpStatus.UNAUTHORIZED)
				}
			} else {
				throw new HttpException('Aucun token trouvé', HttpStatus.NOT_FOUND)
			}
		} catch {
			throw new HttpException('Non autorisé', HttpStatus.UNAUTHORIZED)
	   }
	}
}