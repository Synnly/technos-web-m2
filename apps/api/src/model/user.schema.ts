import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type UserDocument = User & Document;

/**
 * Représente une entité Utilisateur dans le système.
 */
@Schema()
export class User {
    /**
     * Le pseudo (nom d'utilisateur) de l'utilisateur.
     * Ce champ est requis.
     */
    @Prop({ required: true })
    pseudo: string;

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
     * Indique si l'utilisateur a récupéré ses points quotidiens.
     * Ce champ est requis et a une valeur par défaut de false.
     */
    @Prop({ required: true, default: false })
    pointsQuotidiensRecuperes: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);