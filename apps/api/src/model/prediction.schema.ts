import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PredictionDocument = Prediction & Document;

/**
 * Représente une prédiction dans le système.
 */
export enum PredictionStatus {
    Valid = 'Valid',
    Invalide = 'Invalide',
    EnAttente = 'en attente',
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
    @Prop({ required: true, enum: Object.values(PredictionStatus), default: PredictionStatus.EnAttente })
    status: PredictionStatus;

    /** Date de fin (deadline) - obligatoire */
    @Prop({ type: Date, required: true })
    dateFin: Date;

    /** Options associées: map de clef(string) -> valeur(number) */
    @Prop({ type: Map, of: Number, default: {} })
    options: Record<string, number>;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);
