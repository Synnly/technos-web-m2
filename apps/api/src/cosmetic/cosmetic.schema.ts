import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type CosmeticDocument = Cosmetic & Document;

/**
 * Énumération des types de cosmétiques disponibles
 * Permet d'avoir un filtrage rapide des cosmétiques par type
 * - BADGE : Représente une icon de type : 🔰, ⚜️..., que l'utilisateur peut afficher
 * - COLOR : Représente une couleur que l'utilisateur peut appliquer à son pseudo
 * Permet d'ajouter facilement de nouveaux types de cosmétiques à l'avenir et des champs
 * optionnels spécifiques à chaque type
 */
export enum CosmeticType {
	BADGE = "badge",
	COLOR = "color",
}

/**
 * Schéma représentant un cosmétique
 */
@Schema()
export class Cosmetic {
	/** Identifiant unique */
	_id: string;

	/** Nom du cosmétique
	 * Ce champ est requis
	 */
	@Prop({ required: true })
	name: string;

	/** Coût du cosmétique
	 * Ce champ est requis
	 */
	@Prop({ required: true })
	cost: number;

	/** Type du cosmétique
	 * Ce champ est requis et doit être l'une des valeurs définies dans l'énumération CosmeticType
	 */
	@Prop({ required: true, enum: CosmeticType })
	type: CosmeticType;

	/**
	 * Valeur du cosmétique
	 * - Pour un badge, pour l'icône (ex: "🔰") on met :beginner:
	 * - Pour une couleur c'est le code hexadécimal (ex: "#ff0000")
	 */
	@Prop({ required: true })
	value: string;
}

export const CosmeticSchema = SchemaFactory.createForClass(Cosmetic);