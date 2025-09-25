import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

export type VoteDocument = Vote & Document;

@Schema()
export class Vote {

    _id : string;

    /**
     * La quantité de points votée.
     * Ce champ est requis.
     */
    @Prop({ required: true })
    amount: number;

    /**
     * La prediction associée au vote.
     * Ce champ est requis.
     */
    @Prop({ type: Types.ObjectId, ref: 'Prediction', required: true })
    prediction_id: Types.ObjectId;

    /**
     * L'option choisie pour la prédiction.
     * Ce champ est requis.
     */
    @Prop({ required: true })
    option: string;

    /** 
     * La date du vote.
     * Par défaut, la date actuelle est utilisée.
     * Ce champ est requis.
     */
    @Prop({ type: Date, default: Date.now, required: true })
    date: Date;

    /**
     * L'utilisateur ayant effectué le vote.
     * Ce champ est requis.
     */
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);