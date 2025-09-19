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
     * Crée une instance de UserService.
     * @param userModel - Le modèle utilisateur injecté pour interagir avec la base de données.
     */
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    
    /**
     * Récupère tous les utilisateurs du système.
     * 
     * @returns Une promesse qui résout un tableau d'objets utilisateur.
     */
    async getAll(): Promise<User[]> {
        return await this.userModel.find().exec();
    }

    /**
     * Récupère un utilisateur unique basé sur le pseudo fourni.
     *
     * @param pseudo - Le pseudo (nom d'utilisateur ou identifiant) de l'utilisateur à récupérer.
     * @returns Une promesse qui résout l'objet utilisateur s'il est trouvé, ou `undefined` si aucun utilisateur ne correspond au pseudo donné.
     */
    async getByPseudo(pseudo: any): Promise<User | undefined> {
        return await this.userModel.findOne({ pseudo }).exec() ?? undefined;
    }


    /**
     * Récupère un utilisateur unique basé sur l'identifiant fourni.
     * 
     * @param id - L'identifiant unique de l'utilisateur à récupérer.
     * @returns Une promesse qui résout l'objet utilisateur s'il est trouvé, ou `undefined` si aucun utilisateur ne correspond à l'identifiant donné.
     */
    async getById(id: string): Promise<User | undefined> {
        return await this.userModel.findById(id).exec() ?? undefined;
    }
    
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
    async createUser(user: User): Promise<User> {
        const existingUser = await this.userModel.findOne({ pseudo: user.pseudo }).exec();
        if (existingUser) {
            throw new HttpException('Pseudo déjà utilisé.', HttpStatus.BAD_REQUEST);
        }

        // Validation des champs requis
        if (!user.motDePasse) throw new HttpException('Le mot de passe est requis.', HttpStatus.BAD_REQUEST);
        if (!user.pseudo) throw new HttpException('Le pseudo est requis.', HttpStatus.BAD_REQUEST);

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
    async getJwtToken(user: User, jwt: JwtService): Promise<any> {
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

    /**
     * Crée un nouvel utilisateur ou met à jour un utilisateur existant par son identifiant.
     * 
     * Si un utilisateur avec l'identifiant spécifié existe, ses informations sont mises à jour.
     * Si aucun utilisateur n'existe avec l'identifiant donné, un nouvel utilisateur est créé.
     * 
     * @param id - L'identifiant unique de l'utilisateur.
     * @param user - Les données de l'utilisateur à créer ou mettre à jour. Doit inclure `pseudo` et `motDePasse` pour les nouveaux utilisateurs.
     * @returns Une promesse qui résout l'utilisateur créé ou mis à jour.
     * 
     * @throws {HttpException} Si `motDePasse` ou `pseudo` est manquant lors de la création d'un nouvel utilisateur.
     */
    async createOrUpdateById(id: string, user: User): Promise<User> {
        const existingUser = await this.userModel.findById(id).exec();
        
        if (existingUser) {     // Met à jour l'utilisateur existant
            existingUser.pseudo = user.pseudo ?? existingUser.pseudo;
            existingUser.motDePasse = await bcrypt.hash(user.motDePasse, 10) ?? existingUser.motDePasse;
            
            return await existingUser.save();
        } else {                // Crée un nouvel utilisateur

            if (!user.motDePasse) throw new HttpException('Le mot de passe est requis.', HttpStatus.BAD_REQUEST);
            if (!user.pseudo) throw new HttpException('Le pseudo est requis.', HttpStatus.BAD_REQUEST);
            
            const hash = await bcrypt.hash(user.motDePasse, 10);
            const reqBody = {
                pseudo: user.pseudo,
                motDePasse: hash
            }
            const newUser = new this.userModel(reqBody);
            return await newUser.save();
        }
    }
    
    /**
     * Supprime un utilisateur de la base de données en utilisant son identifiant.
     *
     * @param id - L'identifiant unique de l'utilisateur à supprimer.
     * @returns Une promesse qui résout l'utilisateur supprimé s'il existe, ou `undefined` si aucun utilisateur n'a été trouvé avec cet identifiant.
     */
    async deleteById(id : string) : Promise<User> {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    
        if (!deletedUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        
        return deletedUser
    }
}