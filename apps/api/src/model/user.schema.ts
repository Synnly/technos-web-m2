import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Prediction } from './prediction.schema';
import { Vote } from './vote.schema';
export type UserDocument = User & Document;

export enum Role {
    USER = 'user',
    ADMIN = 'admin',
    VIP = 'vip',
    PRENIUM = 'premium',
    PLUS = 'plus'
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
     * Indique si l'utilisateur a récupéré ses points quotidiens.
     * Ce champ est requis et a une valeur par défaut de false.
     */
    @Prop({ required: true, default: false })
    pointsQuotidiensRecuperes: boolean;

    /**
     * Les prédictions associées à l'utilisateur.
     * Ce champ est une liste de références vers des documents de type Prediction.
     */
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' }] })
    predictions: Prediction[];


    /**
     * Les votes associés à l'utilisateur.
     * Ce champ est une liste de références vers des documents de type Vote.
     */
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vote', default: [] }] })
    votes: Vote[];

    @Prop({ type: String, enum: Role, required: true})
    role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);