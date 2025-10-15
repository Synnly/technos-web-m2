import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role, User, UserDocument } from "../user/user.schema";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Cosmetic } from "../../src/cosmetic/cosmetic.schema";
import { CreateUserDto } from "./dto/createuser.dto";
import { UpdateUserDto } from "./dto/updateuser.dto";
import { Prediction } from "src/prediction/prediction.schema";
import { PredictionService } from "src/prediction/prediction.service";
import { Vote } from "src/vote/vote.schema";
import { VoteService } from "src/vote/vote.service";

@Injectable()
/**
 * Service responsable de la gestion des opérations liées aux utilisateurs.
 */
export class UserService {
	/**
	 * Crée une instance de UserService.
	 * @param userModel - Le modèle utilisateur injecté pour interagir avec la base de données.
	 */
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private predictionService: PredictionService,
		private voteService: VoteService,
	) {}

	/**
	 * Récupère tous les utilisateurs du système.
	 * @returns Une promesse qui résout un tableau d'objets utilisateur.
	 */
	async getAll(): Promise<User[]> {
		return await this.userModel.find().exec();
	}

	/**
	 * Récupère un utilisateur unique basé sur le nom d'utilisateur fourni.
	 * @param username Le nom d'utilisateur (nom d'utilisateur ou identifiant) de l'utilisateur à récupérer.
	 * @returns Une promesse qui résout l'objet utilisateur s'il est trouvé, ou `undefined` si aucun utilisateur ne correspond au username donné.
	 */
	async getByUsername(username: any): Promise<User | undefined> {
		return (await this.userModel.findOne({ username }).exec()) ?? undefined;
	}

	/**
	 * Crée un nouvel utilisateur dans la base de données.
	 * @param createUserDto Les données nécessaires pour créer un nouvel utilisateur.
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
		newUser.save();
	}

	/**
	 * Génère un token JWT pour un utilisateur donné si les informations d'identification sont valides.
	 * @param username Le nom d'utilisateur de l'utilisateur.
	 * @param password Le mot de passe de l'utilisateur.
	 * @param jwt Le service JWT utilisé pour signer le token.
	 * @returns Une promesse qui résout un objet contenant le token JWT si les informations d'identification sont valides.
	 * @throws Error si l'utilisateur n'est pas trouvable ou si les informations d'identification sont incorrectes.
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
	 * Met à jour un utilisateur existant basé sur le nom d'utilisateur fourni, ou crée un nouvel utilisateur si aucun n'existe.
	 * @param username Le nom d'utilisateur de l'utilisateur à mettre à jour ou à créer.
	 * @param updateUserDto L'objet utilisateur contenant les informations à mettre à jour ou à utiliser pour la création.
	 */
	async createOrUpdateByUsername(username: string, updateUserDto: UpdateUserDto) {
		const existingUser = await this.userModel.findOne({ username }).exec();

		if (existingUser) {
			if (updateUserDto.motDePasse) {
				existingUser.motDePasse = await bcrypt.hash(updateUserDto.motDePasse, 10);
			}
			existingUser.points = updateUserDto.points ?? existingUser.points;
			existingUser.dateDerniereRecompenseQuotidienne =
				updateUserDto.dateDerniereRecompenseQuotidienne ?? existingUser.dateDerniereRecompenseQuotidienne;

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
		}
	}

	/**
	 * Supprime un utilisateur de la base de données à partir de son identifiant.
	 * @param id L'identifiant de l'utilisateur à supprimer.
	 * @returns Une promesse qui résout l'utilisateur supprimé si trouvé, ou lève une exception si aucun utilisateur n'est trouvé avec cet identifiant.
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
	 * Permet à un utilisateur de réclamer une récompense quotidienne.
	 * @param username Le nom d'utilisateur de l'utilisateur réclamant la récompense.
	 * @returns Une promesse qui résout le nombre de points ajoutés à l'utilisateur.
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
	 * @param user l'utilisateur achetant le cosmétique
	 * @param cosmetic le cosmétique à acheter
	 * @returns l'utilisateur mis à jour après l'achat
	 */
	async buyCosmetic(user, cosmetic: Cosmetic): Promise<User> {
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
		return user;
	}
}
