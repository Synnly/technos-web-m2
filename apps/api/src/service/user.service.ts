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
     * Crée un nouvel utilisateur dans la base de données.
     * 
     * Avant de créer l'utilisateur, cette méthode vérifie si un utilisateur avec le même pseudo existe déjà.
     * Si c'est le cas, une exception HTTP est levée pour indiquer que le pseudo est déjà utilisé.
     * Le mot de passe de l'utilisateur est haché avant d'être stocké dans la base de données pour des raisons de 
     * sécurité.
     * 
     * @param user - L'objet utilisateur contenant les informations nécessaires à la création (doit inclure `pseudo` et 
     * `motDePasse`).
     * @returns Une promesse qui résout l'utilisateur nouvellement créé.
     * 
     * @throws HttpException - Levée avec un statut HttpStatus.BAD_REQUEST si le pseudo est déjà utilisé ou si les 
     * champs requis sont manquants.
     */
    async createUser(user: User): Promise<User> {
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
     * @throws HttpException - Levée avec un statut HttpStatus.UNAUTHORIZED si le nom d'utilisateur ou le mot de passe 
     * est incorrect.
     */
    async getJwtToken(pseudo: string, password: string, jwt: JwtService): Promise<any> {
        const foundUser = await this.userModel.findOne({ pseudo: pseudo }).exec();
        if (!foundUser) throw new HttpException('L\'utilisateur n\'est pas trouvable', HttpStatus.NOT_FOUND);

        if (foundUser) {
            const { motDePasse } = foundUser;
            const hash = await bcrypt.hash(password, 10);
            if (bcrypt.compare(hash, motDePasse)) {
                const payload = { pseudo: pseudo };
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
            if (user.motDePasse){
                existingUser.motDePasse = await bcrypt.hash(user.motDePasse, 10)
            }
            existingUser.points = user.points ?? existingUser.points;
            existingUser.pointsQuotidiensRecuperes = user.pointsQuotidiensRecuperes ?? existingUser.pointsQuotidiensRecuperes;
            
            return await existingUser.save();
        } else {                // Crée un nouvel utilisateur
            
            const hash = await bcrypt.hash(user.motDePasse, 10);
            const reqBody = {
                pseudo: user.pseudo,
                motDePasse: hash
            }
            const newUser = new this.userModel(reqBody);
            return await newUser.save();
        }
    }

    async createOrUpdateByPseudo(pseudo: string, user: User): Promise<User> {
        const existingUser = await this.userModel.findOne({ pseudo }).exec();
        
        if (existingUser) {     // Met à jour l'utilisateur existant
            existingUser.pseudo = user.pseudo ?? existingUser.pseudo;
            if (user.motDePasse){
                existingUser.motDePasse = await bcrypt.hash(user.motDePasse, 10)
            }
            existingUser.points = user.points ?? existingUser.points;
            existingUser.pointsQuotidiensRecuperes = user.pointsQuotidiensRecuperes ?? existingUser.pointsQuotidiensRecuperes;
            
            return await existingUser.save();
        } else {                // Crée un nouvel utilisateur
            
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
     * Supprime un utilisateur de la base de données à partir de son identifiant.
     *
     * @param id - Identifiant unique de l'utilisateur à supprimer.
     * @returns Une promesse qui résout l'utilisateur supprimé si trouvé, ou lève une exception si aucun utilisateur n'est trouvé avec cet identifiant.
     * @throws HttpException - Levée avec un statut HttpStatus.NOT_FOUND si l'utilisateur n'existe pas.
     */
    async deleteById(id : string) : Promise<User> {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    
        if (!deletedUser) {
            throw new HttpException('L\'utilisateur n\'est pas trouvable', HttpStatus.NOT_FOUND);
        }
        
        return deletedUser
    }

    async deleteByPseudo(pseudo: string){
        const deletedUser = await this.userModel.findOneAndDelete({ pseudo }).exec();

        if (!deletedUser) {
            throw new HttpException('L\'utilisateur n\'est pas trouvable', HttpStatus.NOT_FOUND);
        }

        return deletedUser;
    }
}