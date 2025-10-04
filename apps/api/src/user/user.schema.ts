import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Prediction } from "../prediction/prediction.schema";
import { Vote } from "../vote/vote.schema";
import { Cosmetic } from "src/cosmetic/cosmetic.schema";
export type UserDocument = User & Document;

/**
 * Enumération des rôles utilisateur
 */
export enum Role {
	USER = "user",
	ADMIN = "admin",
	VIP = "vip",
	PREMIUM = "premium",
	PLUS = "plus",
}

/**
 * Représente une entité Utilisateur dans le système.
 */
@Schema()
export class User {
	_id: string;

	/**
	 * Le nom d'utilisateur.
	 * Ce champ est requis.
	 */
	@Prop({ required: true })
	username: string;

	/**
	 * Le mot de passe de l'utilisateur.
	 * Ce champ est requis.
	 */
	@Prop({ required: true })
	motDePasse: string;

	/**
	 * Les points associés à l'utilisateur.
	 * Ce champ est requis et a une valeur par défaut de 50.
	 */
	@Prop({ required: true, default: 50 })
	points: number;

	/**
	 * Indique la date de la dernière récupération des points quotidiens.
	 * Ce champ peut être nul si l'utilisateur n'a jamais récupéré de points quotidiens.
	 */
	@Prop({ default: null, type: Date })
	dateDerniereRecompenseQuotidienne: Date | null;

	/**
	 * Les prédictions associées à l'utilisateur.
	 * Ce champ est une liste de références vers des documents de type Prediction.
	 */
	@Prop({
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prediction" }],
	})
	predictions: Prediction[];

	/**
	 * Les votes associés à l'utilisateur.
	 * Ce champ est une liste de références vers des documents de type Vote.
	 */
	@Prop({
		type: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "Vote", default: [] },
		],
	})
	votes: Vote[];

	/**
	 * Le rôle de l'utilisateur.
	 * Ce champ est requis.
	 */
	@Prop({ type: String, enum: Role, required: true, default: Role.USER })
	role: Role;


	/**
	 * Liste des cosmétiques possédés par l'utilisateur.
	 * Ce champ est une liste de chaînes représentant les identifiants des cosmétiques.
	 */
	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cosmetic" }], default: [] })
	cosmeticsOwned: string[];

	/**
	 * Cosmétique actuellement appliqué par l'utilisateur (persisté).
	 * Peut être null si aucun cosmétique n'est appliqué.
	 */
	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Cosmetic", default: null })
	currentCosmetic: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
