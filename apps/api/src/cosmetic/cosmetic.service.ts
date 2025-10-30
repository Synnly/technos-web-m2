import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cosmetic, CosmeticDocument } from "./cosmetic.schema";
import { CreateCosmeticDto } from "./dto/create-cosmetic.dto";
import { UpdateCosmeticDto } from "./dto/update-cosmetic.dto";

/**
 * Service pour gérer les cosmétiques.
 */
@Injectable()
export class CosmeticService {
	constructor(
		@InjectModel(Cosmetic.name)
		private cosmeticModel: Model<CosmeticDocument>,
	) {}

	/**
	 * Retourne tous les cosmétiques.
	 * @returns les cosmétiques
	 */
	async findAll(): Promise<Cosmetic[]> {
		return this.cosmeticModel.find().exec();
	}

	/**
	 * Recherche un cosmétique par son identifiant.
	 * @param id l'identifiant du cosmétique à rechercher
	 * @returns le cosmétique trouvé
	 */
	async findById(id: string): Promise<Cosmetic | null> {
		const cosmetic = await this.cosmeticModel.findById(id).exec();
		return cosmetic;
	}

	/**
	 * Crée un nouveau cosmétique.
	 * @param cosmetic les données du cosmétique à créer
	 * @returns le cosmétique créé
	 */
	async create(cosmetic: CreateCosmeticDto) {
		const newCosmetic = new this.cosmeticModel(cosmetic as any);
		await newCosmetic.save();
	}

	/**
	 * Met à jour un cosmétique par son identifiant.
	 * @param id l'identifiant du cosmétique à mettre à jour
	 * @param cosmetic les nouvelles données du cosmétique
	 * @returns la cosmétique mis à jour
	 */
	async updateById(id: string, cosmetic: UpdateCosmeticDto) {
		await this.cosmeticModel.findByIdAndUpdate(id, cosmetic as any, { new: true }).exec();
	}

	/**
	 * Supprime un cosmétique par son identifiant.
	 * @param id l'identifiant du cosmétique à supprimer
	 * @returns le cosmétique supprimé
	 */
	async deleteById(id: string) {
		await this.cosmeticModel.findByIdAndDelete(id).exec();
	}
}
