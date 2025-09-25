import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema()
export class Publication {

    /** Identifiant unique */
    _id : string;

    /** Message de la publication 
     *  Ce champ est requis
    */
    @Prop({ required: true })
    message : string;

    /** Date de publication 
     *  Ce champ est requis et par défaut la date courante
    */
    @Prop({ type: Date, default: Date.now, required: true })
    datePublication : Date;

    /** Id de la prediction attenante  
     *  Ce champ est requis
    */
    @Prop({ type: Types.ObjectId, ref : "Prediction",  required : true })
    prediction_id : Types.ObjectId;

    /** Id de la publication parente (en cas de réponse) */
    @Prop ({ type : Types.ObjectId, ref : "Publication", required : false})
    parentPublication_id? : Types.ObjectId;

    /** Id de l'utilisateur ayant posté la publication 
     *  Ce champ est requis
    */
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    user_id: Types.ObjectId;

}