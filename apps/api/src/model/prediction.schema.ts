import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type PredictionDocument = Prediction & Document;

/**
 * Représente une prédiction dans le système.
 */
export enum PredictionStatus {
    Valid = 'Valid',
    Invalid = 'Invalid',
    Waiting = 'waiting',
}

@Schema()
export class Prediction {

    /** Identifiant unique */
    _id?: string;

    /** Titre de la prédiction (requis) */
    @Prop({ required: true })
    title: string;

    /** Description textuelle */
    @Prop()
    description?: string;

    /** Statut de la prédiction */
    @Prop({ required: true, enum: Object.values(PredictionStatus), default: PredictionStatus.Waiting })
    status: PredictionStatus;

    /** Date de fin (deadline) - obligatoire */
    @Prop({ type: Date, required: true })
    dateFin: Date;

    /** Options objet de type clé : valeur */
    @Prop({ type: Object, of: Number, default: {}, required: true })
    options: Record<string, number>;

    /** Référence à l'utilisateur qui a créé la prédiction */
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);
