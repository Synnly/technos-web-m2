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
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    
    /**
     * Récupère tous les utilisateurs du système.
     * 
     * @returns Une promesse qui résout un tableau d'objets utilisateur.
     */
    async getAll(): Promise<User[]> {
        return await this.userModel.find().exec();
    }

    /**
     * Récupère un utilisateur unique basé sur le nom d'utilisateur fourni.
     *
     * @param username - Le nom d\'utilisateur (nom d'utilisateur ou identifiant) de l'utilisateur à récupérer.
     * @returns Une promesse qui résout l'objet utilisateur s'il est trouvé, ou `undefined` si aucun utilisateur ne correspond au username donné.
     */
    async getByUsername(username: any): Promise<User | undefined> {
        return await this.userModel.findOne({ username }).exec() ?? undefined;
    }

    
    /**
     * Crée un nouvel utilisateur dans la base de données.
     * 
     * Avant de créer l'utilisateur, cette méthode vérifie si un utilisateur avec le même username existe déjà.
     * Si c'est le cas, une exception HTTP est levée pour indiquer que le nom d'utilisateur est déjà utilisé.
     * Le mot de passe de l'utilisateur est haché avant d'être stocké dans la base de données pour des raisons de 
     * sécurité.
     * 
     * @param user - L'objet utilisateur contenant les informations nécessaires à la création (doit inclure `username` et 
     * `motDePasse`).
     * @returns Une promesse qui résout l'utilisateur nouvellement créé.
     * 
     * @throws HttpException - Levée avec un statut HttpStatus.BAD_REQUEST si le nom d'utilisateur est déjà utilisé.
     */
    async createUser(user: User): Promise<User> {
        const existingUser = await this.userModel.findOne({ username: user.username }).exec();
        if (existingUser) {
            throw new HttpException('Username déjà utilisé.', HttpStatus.BAD_REQUEST);
        }

        const hash = await bcrypt.hash(user.motDePasse, 10);
        const reqBody = {
            username: user.username,
            role: user.role ?? 'user',
            motDePasse: hash
        }
        const newUser = new this.userModel(reqBody);
        return newUser.save();
    }

    /**
     * Authentifie un utilisateur en vérifiant ses identifiants et génère un token JWT en cas de succès.
     * @param user - L'objet utilisateur contenant le nom d'utilisateur (nom d'utilisateur) et le motDePasse (mot de passe).
     * @param jwt - L'instance JwtService utilisée pour signer et générer le token JWT.
     * @returns Une promesse qui résout un objet contenant le token JWT si l'authentification réussit.
     *
     * @throws HttpException - Levée avec un statut HttpStatus.UNAUTHORIZED si le nom d'utilisateur ou le mot de passe 
     * est incorrect.
     */
    async getJwtToken(username: string, password: string, jwt: JwtService): Promise<any> {
        const foundUser = await this.userModel.findOne({ username: username }).exec();
        if (!foundUser) throw new HttpException('L\'utilisateur n\'est pas trouvable', HttpStatus.NOT_FOUND);

        if (foundUser) {
            const { motDePasse, role } = foundUser;
            if (await bcrypt.compare(password, motDePasse)) {
                const payload = { username: username, role: role};
                return {
                    token: jwt.sign(payload),
                };
            }
            throw new HttpException('Identifiants incorrects.', HttpStatus.UNAUTHORIZED);
        }
        throw new HttpException('Identifiants incorrects', HttpStatus.UNAUTHORIZED);
    }

    /**
     * Crée ou met à jour un utilisateur par son nom d'utilisateur.
     * @param username - Le nom d'utilisateur de l'utilisateur à créer ou mettre à jour.
     * @param user - Les données de l'utilisateur à créer ou mettre à jour.
     * @returns Une promesse qui résout l'utilisateur créé ou mis à jour.
     */
    async createOrUpdateByUsername(username: string, user: User): Promise<User> {
        const existingUser = await this.userModel.findOne({ username }).exec();
        
        if (existingUser) {     // Met à jour l'utilisateur existant
            existingUser.username = user.username ?? existingUser.username;
            if (user.motDePasse){
                existingUser.motDePasse = await bcrypt.hash(user.motDePasse, 10)
            }
            existingUser.points = user.points ?? existingUser.points;
            existingUser.pointsQuotidiensRecuperes = user.pointsQuotidiensRecuperes ?? existingUser.pointsQuotidiensRecuperes;
            
            return await existingUser.save();
        } else {                // Crée un nouvel utilisateur
            
            const hash = await bcrypt.hash(user.motDePasse, 10);
            const reqBody = {
                username: user.username,
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

    /**
     * Supprime un utilisateur de la base de données à partir de son nom d'utilisateur.
     * @param username - Le nom d'utilisateur de l'utilisateur à supprimer.
     * @returns Une promesse qui résout l'utilisateur supprimé si trouvé, ou lève une exception si aucun utilisateur n'est trouvé avec ce nom d'utilisateur.
     * @throws HttpException - Levée avec un statut HttpStatus.NOT_FOUND si l'utilisateur n'existe pas.`
     */
    async deleteByUsername(username: string){
        const deletedUser = await this.userModel.findOneAndDelete({ username }).exec();

        if (!deletedUser) {
            throw new HttpException('L\'utilisateur n\'est pas trouvable', HttpStatus.NOT_FOUND);
        }

        return deletedUser;
    }
}