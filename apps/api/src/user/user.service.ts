import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role, User, UserDocument } from "../user/user.schema";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Cosmetic } from "../cosmetic/cosmetic.schema";
import { CreateUserDto } from "./dto/createuser.dto";
import { UpdateUserDto } from "./dto/updateuser.dto";
import { Prediction } from "../prediction/prediction.schema";
import { PredictionService } from "../prediction/prediction.service";
import { Vote } from "../vote/vote.schema";
import { VoteService } from "../vote/vote.service";

@Injectable()
/**
 * Service responsable de la gestion des opérations liées aux utilisateurs.
 */
export class UserService {
	/**
	 * Construit le UserService.
	 * @param userModel Le modèle Mongoose pour les utilisateurs.
	 * @param predictionService Le service de prédiction injecté.
	 * @param voteService Le service de vote injecté.
	 */
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private predictionService: PredictionService,
		private voteService: VoteService,
	) {}

	/**
	 * Récupère tous les utilisateurs de la base de données.
	 * @returns Une promesse qui résout un tableau d'objets utilisateur.
	 */
	async getAll(): Promise<User[]> {
		return await this.userModel.find().exec();
	}

	/**
	 * Récupère un utilisateur par son nom d'utilisateur.
	 * @param username Le nom d'utilisateur de l'utilisateur à récupérer.
	 * @returns Une promesse qui résout l'objet utilisateur s'il est trouvé, sinon undefined.
	 */
	async getByUsername(username: any): Promise<User | undefined> {
		return (await this.userModel.findOne({ username }).exec()) ?? undefined;
	}

	/**
	 * Crée un nouvel utilisateur dans la base de données.
	 * @param createUserDto L'objet utilisateur contenant les informations de création.
	 * @throws Error si le nom d'utilisateur est déjà utilisé.
	 */
	async createUser(createUserDto: CreateUserDto) {
		const existingUser = await this.userModel.findOne({ username: createUserDto.username }).exec();
		if (existingUser) {
			throw new Error("Username déjà utilisé.");
		}

		const hash = await bcrypt.hash(createUserDto.motDePasse, 10);
		const reqBody = {
			username: createUserDto.username,
			role: Role.USER,
			motDePasse: hash,
		};
		const newUser = new this.userModel(reqBody);
		await newUser.save();
	}

	/**
	 * Définit le rôle d'un utilisateur à ADMIN basé sur le nom d'utilisateur fourni.
	 * NE PAS UTILISER CETTE FONCTION DANS UN CONTROLEUR ACCESSIBLE PUBLIQUEMENT.
	 * @param username Le nom d'utilisateur de l'utilisateur à promouvoir au rôle ADMIN.
	 * @throws Error si l'utilisateur n'est pas trouvable.
	 */
	async setAdmin(username: string) {
		const user = await this.userModel.findOne({ username: username }).exec();
		if (!user) throw new Error("Utilisateur non trouvé");

		user.role = Role.ADMIN;
		await user.save();
	}

	/**
	 * Génère un token JWT pour un utilisateur donné.
	 * @param username Le nom d'utilisateur de l'utilisateur.
	 * @param password Le mot de passe de l'utilisateur.
	 * @param jwt Le service JWT pour la génération du token.
	 * @returns Une promesse qui résout un objet contenant le token JWT.
	 * @throws Error si l'utilisateur n'est pas trouvable ou si les identifiants sont incorrects.
	 */
	async getJwtToken(username: string, password: string, jwt: JwtService): Promise<any> {
		const foundUser = await this.userModel.findOne({ username: username }).exec();
		if (!foundUser) throw new Error("L'utilisateur n'est pas trouvable");

		if (foundUser) {
			const { motDePasse, role } = foundUser;
			if (await bcrypt.compare(password, motDePasse)) {
				const payload = { username: username, role: role };
				return {
					token: jwt.sign(payload),
				};
			}
			throw new Error("Identifiants incorrects.");
		}
		throw new Error("Identifiants incorrects.");
	}

	/**
	 * Crée ou met à jour un utilisateur basé sur le nom d'utilisateur fourni.
	 * @param username Le nom d'utilisateur de l'utilisateur à créer ou mettre à jour.
	 * @param updateUserDto L'objet contenant les informations de mise à jour.
	 * @returns Une promesse qui résout un booléen indiquant si un nouvel utilisateur a été créé (true) ou mis à jour (false).
	 */
	async createOrUpdateByUsername(username: string, updateUserDto: UpdateUserDto): Promise<boolean> {
		const existingUser = await this.userModel.findOne({ username }).exec();

		if (existingUser) {
			if (updateUserDto.motDePasse) {
				existingUser.motDePasse = await bcrypt.hash(updateUserDto.motDePasse, 10);
			}
			existingUser.points = updateUserDto.points ?? existingUser.points;
			existingUser.dateDerniereRecompenseQuotidienne =
				updateUserDto.dateDerniereRecompenseQuotidienne === undefined
					? existingUser.dateDerniereRecompenseQuotidienne
					: updateUserDto.dateDerniereRecompenseQuotidienne;

			existingUser.role = (updateUserDto.role ?? existingUser.role) as Role;

			// Peuplage des prédictions et votes
			const predictions: Prediction[] = await this.predictionService.getByIds(updateUserDto.predictions ?? []);
			existingUser.predictions = predictions.length > 0 ? predictions : existingUser.predictions;

			const votes: Vote[] = await this.voteService.getByIds(updateUserDto.votes ?? []);
			existingUser.votes = votes.length > 0 ? votes : existingUser.votes;

			existingUser.cosmeticsOwned = updateUserDto.cosmeticsOwned ?? existingUser.cosmeticsOwned;

			existingUser.currentCosmetic = [
				existingUser.currentCosmetic[0] ?? updateUserDto.currentCosmetic?.[0] ?? null,
				existingUser.currentCosmetic[1] ?? updateUserDto.currentCosmetic?.[1] ?? null,
			];

			await existingUser.save();
			return false;
		} else {
			const hash = await bcrypt.hash(updateUserDto.motDePasse, 10);
			const reqBody = {
				username: updateUserDto.username,
				motDePasse: hash,
			};
			const newUser = new this.userModel(reqBody);

			newUser.points = updateUserDto.points ?? 0;
			newUser.dateDerniereRecompenseQuotidienne = updateUserDto.dateDerniereRecompenseQuotidienne ?? null;
			newUser.role = (updateUserDto.role ?? Role.USER) as Role;
			newUser.predictions = await this.predictionService.getByIds(updateUserDto.predictions ?? []);
			newUser.votes = await this.voteService.getByIds(updateUserDto.votes ?? []);
			newUser.cosmeticsOwned = updateUserDto.cosmeticsOwned ?? [];

			newUser.currentCosmetic = [
				updateUserDto.currentCosmetic?.[0] ?? null,
				updateUserDto.currentCosmetic?.[1] ?? null,
			];

			await newUser.save();
			return true;
		}
	}

	/**
	 * Supprime un utilisateur de la base de données à partir de son ID.
	 * @param id L'ID de l'utilisateur à supprimer.
	 * @returns Une promesse qui résout l'utilisateur supprimé si trouvé, ou lève une exception si aucun utilisateur n'est trouvé avec cet ID.
	 * @throws Error si l'utilisateur n'est pas trouvable.
	 */
	async deleteById(id: string): Promise<User> {
		const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

		if (!deletedUser) {
			throw new Error("L'utilisateur n'est pas trouvable");
		}

		return deletedUser;
	}

	/**
	 * Supprime un utilisateur de la base de données à partir de son nom d'utilisateur.
	 * @param username Le nom d'utilisateur de l'utilisateur à supprimer.
	 * @returns Une promesse qui résout l'utilisateur supprimé si trouvé, ou lève une exception si aucun utilisateur n'est trouvé avec ce nom d'utilisateur.
	 * @throws Error si l'utilisateur n'est pas trouvable.
	 */
	async deleteByUsername(username: string) {
		const deletedUser = await this.userModel.findOneAndDelete({ username }).exec();

		if (!deletedUser) {
			throw new Error("L'utilisateur n'est pas trouvable");
		}

		return deletedUser;
	}

	/**
	 * Permet à un utilisateur de réclamer sa récompense quotidienne.
	 * @param username Le nom d'utilisateur de l'utilisateur réclamant la récompense.
	 * @returns Le nombre de points ajoutés à l'utilisateur.
	 * @throws Error si l'utilisateur n'est pas trouvable ou si la récompense a déjà été réclamée aujourd'hui.
	 */
	async claimDailyReward(username: string): Promise<number> {
		const user = await this.userModel.findOne({ username }).exec();
		if (!user) {
			throw new Error("L'utilisateur n'est pas trouvable");
		}

		const today = new Date();
		const lastClaimDate = user.dateDerniereRecompenseQuotidienne;

		// Vérifie si la récompense a déjà été réclamée aujourd'hui
		if (lastClaimDate && lastClaimDate.toDateString() === today.toDateString()) {
			throw new Error("Récompense quotidienne déjà réclamée aujourd'hui.");
		}

		const pointsToAdd = 10;

		// Met à jour la date de la dernière récompense et ajoute des points
		user.dateDerniereRecompenseQuotidienne = today;
		user.points += pointsToAdd;

		await user.save();
		return pointsToAdd; // Retourne le nombre de points ajoutés
	}

	/**
	 * Permet à un utilisateur d'acheter un cosmétique.
	 * @param username Le nom d'utilisateur de l'utilisateur achetant le cosmétique.
	 * @param cosmetic Le cosmétique à acheter.
	 * @throws Error si l'utilisateur n'est pas trouvable, s'il possède déjà le cosmétique, ou s'il n'a pas assez de points.
	 */
	async buyCosmetic(username: String, cosmetic: Cosmetic) {
		const user = await this.userModel.findOne({ username }).exec();
		if (!user) throw new Error("L'utilisateur n'est pas trouvable");

		if (user.cosmeticsOwned.includes(cosmetic._id)) throw new Error("Vous possédez déjà ce cosmétique");
		if (user.points < cosmetic.cost) throw new Error("Vous n'avez pas assez de points pour acheter ce cosmétique");

		user.points -= cosmetic.cost;
		user.cosmeticsOwned.push(cosmetic._id);

		// On stocke les cosmétiques appliqués dans un tableau fixe de (max) 2 positions
		// index 0 = COLOR, index 1 = BADGE
		if (!user.currentCosmetic || !Array.isArray(user.currentCosmetic)) {
			user.currentCosmetic = [null, null];
		} else {
			user.currentCosmetic = [user.currentCosmetic[0] ?? null, user.currentCosmetic[1] ?? null];
		}
		const slotForType = (type: any) => {
			if (!type) return 0;
			if (String(type).toLowerCase().includes("color")) return 0;
			return 1;
		};

		const slot = slotForType((cosmetic as any).type);
		user.currentCosmetic[slot] = cosmetic._id;

		await user.save();
	}
}
