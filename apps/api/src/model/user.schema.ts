import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Prediction } from './prediction.schema';
import { Vote } from './vote.schema';
export type UserDocument = User & Document;

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

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' }] })
    predictions: Prediction[];


    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vote', default: [] }] })
    votes: Vote[];
}

export const UserSchema = SchemaFactory.createForClass(User);