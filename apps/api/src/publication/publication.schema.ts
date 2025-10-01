import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type PublicationDocument = Publication & Document;

@Schema()
export class Publication {
	/** Identifiant unique */
	_id: string;

	/** Message de la publication
	 *  Ce champ est requis
	 */
	@Prop({ required: true })
	message: string;

	/** Date de publication
	 *  Ce champ est requis
	 */
	@Prop({ type: Date, required: true })
	datePublication: Date;

	/** Id de la prediction attenante
	 *  Ce champ est requis
	 */
	@Prop({ type: Types.ObjectId, ref: "Prediction", required: true })
	prediction_id: Types.ObjectId;

	/** Id de la publication parente (en cas de réponse) */
	@Prop({ type: Types.ObjectId, ref: "Publication", required: false })
	parentPublication_id?: Types.ObjectId;

	/** Id de l'utilisateur ayant posté la publication
	 *  Ce champ est requis
	 */
	@Prop({ type: Types.ObjectId, ref: "User", required: true })
	user_id: Types.ObjectId;

	/**
	 * Liste des id des utilisateurs ayant liké la publication
	 */
	@Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [] })
	likes: Types.ObjectId[];
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
