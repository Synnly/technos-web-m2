import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type PredictionDocument = Prediction & Document;

/**
 * Enumération du status (validité) de la prédiction
 */
export enum PredictionStatus {
    Valid = 'Valid',
    Invalid = 'Invalid',
    Waiting = 'waiting',
}

/**
 * Représente une prédiction dans le système.
 */
@Schema()
export class Prediction {

    /** Identifiant unique */
    _id : string;

    /** 
     * Titre de la prédiction.
     * Ce champ est requis.
     * */
    @Prop({ required: true })
    title: string;

    /**
     * Description de la prédiction.
     */
    @Prop()
    description?: string;

    /**
     * Statut de la prédiction.
     * Valeurs possibles : 'Valid', 'Invalid', 'waiting'.
     * Ce champ est requis et a une valeur par défaut de 'waiting'.
     */
    @Prop({ required: true, enum: PredictionStatus, default: PredictionStatus.Waiting })
    status: PredictionStatus;

    /**
     * Date de fin de la prédiction.
     * Ce champ est requis.
     */
    @Prop({ type: Date, required: true })
    dateFin: Date;

    /**
     * Options de la prédiction avec la quantité de points mise en jeu pour chaque option.
     * Doit contenir au moins deux options.
     * La clé est le nom de l'option et la valeur est la quantité de points mise en 
     * jeu (entier).
     * Ce champ est requis et a une valeur par défaut d'un objet vide.
     */
    @Prop({ type: Object, of: Number, default: {}, required: true })
    options: Record<string, number>;

    /**
     * Référence à l'utilisateur qui a créé la prédiction.
     * Ce champ est requis.
     */
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    /**
     * Résultats de la prédiction.
     * Chaîne vide si la prédiction n'est pas encore validée par un administrateur.
     */
    @Prop({ type: String, default: '' })
    results: string;

    /**
     * Pronostics de l'IA pour cette prédiction.
     * La clé est le nom de l'option et la valeur est la probabilité (entre 0 et 1)
     * que cette option soit correcte selon l'IA.
     * Si les pronostics de l'IA ne sont pas disponibles, ce champ peut être absent.
     * Ce champ est optionnel et a une valeur par défaut d'un objet vide.
     *  
     * Note : Si l'option ENABLE_AI_PRONOSTICS est désactivée, les pronostics de l'IA ne seront pas mises à jour.
     */
    @Prop({ type: Object, of: Number, default: {} })
    pronostics_ia?: Record<string, number>;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);
