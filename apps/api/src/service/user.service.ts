import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../model/user.schema";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
/**
 * Service responsable de la gestion des opérations liées aux utilisateurs.
 */
export class UserService {
    

    /**
     * Récupère un utilisateur unique basé sur le pseudo fourni.
     *
     * @param pseudo - Le pseudo (nom d'utilisateur ou identifiant) de l'utilisateur à récupérer.
     * @returns Une promesse qui résout l'objet utilisateur s'il est trouvé, ou `undefined` si aucun utilisateur ne correspond au pseudo donné.
     */
    async getOne(pseudo: any): Promise<User | undefined> {
        return await this.userModel.findOne({ pseudo }).exec() ?? undefined;
    }
    
    /**
     * Crée une instance de UserService.
     * @param userModel - Le modèle utilisateur injecté pour interagir avec la base de données.
     */
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    
    /**
     * Enregistre un nouvel utilisateur dans le système.
     * 
     * Cette méthode vérifie si un utilisateur avec le même pseudo existe déjà.
     * Si le pseudo est déjà utilisé, elle lève une exception HTTP avec un 
     * statut `BAD_REQUEST`. Sinon, elle hache le mot de passe de l'utilisateur et 
     * crée un nouvel enregistrement utilisateur dans la base de données.
     * 
     * @param user - L'objet utilisateur contenant le pseudo et le motDePasse (mot de passe).
     * @returns Une promesse qui résout le nouvel utilisateur créé.
     * @throws {HttpException} Si le pseudo est déjà utilisé.
     */
    async signup(user: User): Promise<User> {
        const existingUser = await this.userModel.findOne({ pseudo: user.pseudo }).exec();
        if (existingUser) {
            throw new HttpException('Pseudo déjà utilisé.', HttpStatus.BAD_REQUEST);
        }
        const hash = await bcrypt.hash(user.motDePasse, 10);
        const reqBody = {
            pseudo: user.pseudo,
            motDePasse: hash
        }
        const newUser = new this.userModel(reqBody);
        return newUser.save();
    }

    /**
     * Authentifie un utilisateur en vérifiant ses identifiants et génère un token JWT en cas de succès.
     * @param user - L'objet utilisateur contenant le pseudo (nom d'utilisateur) et le motDePasse (mot de passe).
     * @param jwt - L'instance JwtService utilisée pour signer et générer le token JWT.
     * @returns Une promesse qui résout un objet contenant le token JWT si l'authentification réussit.
     *
     * @throws HttpException - Levée avec un statut HttpStatus.UNAUTHORIZED si le nom d'utilisateur ou le mot de passe est incorrect.
     */
    async signin(user: User, jwt: JwtService): Promise<any> {
        const foundUser = await this.userModel.findOne({ pseudo: user.pseudo }).exec();
        if (foundUser) {
            const { motDePasse } = foundUser;
            if (bcrypt.compare(user.motDePasse, motDePasse)) {
                const payload = { pseudo: user.pseudo };
                return {
                    token: jwt.sign(payload),
                };
            }
            throw new HttpException('Identifiants incorrects.', HttpStatus.UNAUTHORIZED);
        }
        throw new HttpException('Identifiants incorrects', HttpStatus.UNAUTHORIZED);
    }
}