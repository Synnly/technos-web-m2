import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cosmetic, CosmeticDocument, CosmeticType } from "../cosmetic/cosmetic.schema";
import { Role, User, UserDocument } from "src/user/user.schema";
import { CreateCosmeticDto } from "src/cosmetic/dto/create-cosmetic.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class SeedService {
	constructor(
		@InjectModel(Cosmetic.name)
		private readonly cosmeticModel: Model<CosmeticDocument>,
		@InjectModel(User.name)
		private readonly userModel: Model<UserDocument>,
	) {}

	/**
	 * Initialise la base de données avec des cosmétiques prédéfinis.
	 * Si un cosmétique avec le même nom existe déjà, il n'est pas recréé pour éviter de dupliquer les entrées.
	 * @returns {Promise<void>} Une promesse qui se résout lorsque le processus de seed est terminé.
	 */
	async seedCosmetics() {
		const cosmetics: CreateCosmeticDto[] = [
			{ name: "Rouge", cost: 100, type: CosmeticType.COLOR, value: "#e23030ff" },
			{ name: "Bleu", cost: 100, type: CosmeticType.COLOR, value: "#2b2bd4ff" },
			{ name: "Vert", cost: 100, type: CosmeticType.COLOR, value: "#37cc37ff" },
			{ name: "Bronze", cost: 200, type: CosmeticType.COLOR, value: "#cd7f32ff" },
			{ name: "Argent", cost: 300, type: CosmeticType.COLOR, value: "#c0c0c0ff" },
			{ name: "Or", cost: 500, type: CosmeticType.COLOR, value: "#ffd700ff" },
			{ name: "Platine", cost: 700, type: CosmeticType.COLOR, value: "#90daacff" },
			{ name: "Diamant", cost: 800, type: CosmeticType.COLOR, value: "#83e6fcff" },
			{ name: "Sapin", cost: 150, type: CosmeticType.COLOR, value: "#1c4e32ff" },
			{ name: "Citrouille", cost: 150, type: CosmeticType.COLOR, value: "#ff7518ff" },
			{ name: "Azur", cost: 250, type: CosmeticType.COLOR, value: "#44a1ffff" },
			{ name: "Débutant", cost: 100, type: CosmeticType.BADGE, value: ":beginner:" },
			{ name: "Piques", cost: 100, type: CosmeticType.BADGE, value: ":spades:" },
			{ name: "Cœurs", cost: 100, type: CosmeticType.BADGE, value: ":hearts:" },
			{ name: "Carreaux", cost: 100, type: CosmeticType.BADGE, value: ":diamonds:" },
			{ name: "Trèfles", cost: 100, type: CosmeticType.BADGE, value: ":clubs:" },
			{ name: "Preneur de risques", cost: 300, type: CosmeticType.BADGE, value: ":slot_machine:" },
			{ name: "It's not about the money", cost: 500, type: CosmeticType.BADGE, value: ":black_joker:" },
			{ name: "Plein aux as", cost: 700, type: CosmeticType.BADGE, value: ":dollar:" },
			{ name: "StopGame", cost: 900, type: CosmeticType.BADGE, value: ":gem:" },
			{ name: "To the moon", cost: 1200, type: CosmeticType.BADGE, value: ":rocket:" },
			{ name: "Baguette", cost: 150, type: CosmeticType.BADGE, value: ":flag-fr:" },
			{ name: "Pizza", cost: 150, type: CosmeticType.BADGE, value: ":flag-it:" },
			{ name: "Chorrizo", cost: 150, type: CosmeticType.BADGE, value: ":flag-es:" },
			{ name: "Pastel de Nata", cost: 150, type: CosmeticType.BADGE, value: ":flag-pt:" },
			{ name: "Bierre", cost: 150, type: CosmeticType.BADGE, value: ":flag-de:" },
			{ name: "Thé", cost: 150, type: CosmeticType.BADGE, value: ":flag-gb:" },
			{ name: "Frites", cost: 150, type: CosmeticType.BADGE, value: ":flag-be:" },
			{ name: "Sushi", cost: 150, type: CosmeticType.BADGE, value: ":flag-jp:" },
			{ name: "Taco", cost: 150, type: CosmeticType.BADGE, value: ":flag-mx:" },
			{ name: "Burger", cost: 150, type: CosmeticType.BADGE, value: ":flag-us:" },
		];

		for (const cosmeticData of cosmetics) {
			const existingCosmetic = await this.cosmeticModel.findOne({ name: cosmeticData.name }).exec();
			if (!existingCosmetic) {
				const newCosmetic = new this.cosmeticModel(cosmeticData);
				await newCosmetic.save();
			}
		}
	}

	/**
	 * Initialise la base de données avec des utilisateurs administrateurs prédéfinis.
	 * Si un administrateur avec le même nom d'utilisateur existe déjà, il n'est pas recréé pour éviter de dupliquer les entrées.
	 * LE MOT DE PASSE DOIT ÊTRE CHANGÉ AVANT LA MISE EN PRODUCTION.
	 * @returns {Promise<void>} Une promesse qui se résout lorsque le processus de seed est terminé.
	 */
	async seedAdmins() {
		const admins: Partial<User>[] = [
			{
				username: "admin",
				motDePasse:
					"THISISAREALLYLONGPASSWORDBUTYOUSTILLSHOULDCHANGEITBEFORELAUNCHINGTOPRODPLEASEFORTHELOVEOFGODTHISPASSWORDWILLNOTCHANGEOTHERWISE",
				role: Role.ADMIN,
			},
		];
		for (const adminData of admins) {
			const existingAdmin = await this.userModel.findOne({ username: adminData.username }).exec();
			if (!existingAdmin) {
				const hash = await bcrypt.hash(adminData.motDePasse, 10);
				const reqBody = {
					username: adminData.username,
					role: Role.ADMIN,
					motDePasse: hash,
				};
				const newAdmin = new this.userModel(reqBody);
				await newAdmin.save();
			}
		}
	}
}
