import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cosmetic, CosmeticDocument } from "./cosmetic.schema";

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
	async findById(id: string): Promise<Cosmetic> {
		const cosmetic = await this.cosmeticModel.findById(id).exec();
		return cosmetic!;
	}

    /**
     * Crée un nouveau cosmétique.
     * @param cosmetic les données du cosmétique à créer
     * @returns le cosmétique créé
     */
	async create(cosmetic: Cosmetic): Promise<Cosmetic> {
		const newCosmetic = new this.cosmeticModel(cosmetic);
		return newCosmetic.save();
	}

    /**
     * Met à jour un cosmétique par son identifiant.
     * @param id l'identifiant du cosmétique à mettre à jour
     * @param cosmetic les nouvelles données du cosmétique
     * @returns la cosmétique mis à jour
     */
	async updateById(id: string, cosmetic: Cosmetic): Promise<Cosmetic> {
		const updatedCosmetic = await this.cosmeticModel
			.findByIdAndUpdate(id, cosmetic, { new: true })
			.exec();
		
		return updatedCosmetic!;
	}

    /**
     * Supprime un cosmétique par son identifiant.
     * @param id l'identifiant du cosmétique à supprimer
     * @returns le cosmétique supprimé
     */
	async deleteById(id: string): Promise<Cosmetic> {
		const result = await this.cosmeticModel.findByIdAndDelete(id).exec();
		return result!;
	}
}