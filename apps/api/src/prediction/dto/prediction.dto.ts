import { Prediction } from '../prediction.schema';

/**
 * DTO pour transférer les données d'une prédiction côté API.
 */
export class PredictionDto {
    _id: string;
    title: string;
    description?: string;
    status: string;
    createdAt: Date;
    dateFin: Date;
    options: Record<string, number>;
    user_id: string;
    result: string;
    pronostics_ia?: Record<string, number>;

    constructor(pred: Prediction & any) {
        this._id = String((pred as any)._id);
        this.title = pred.title;
        this.description = pred.description;
        this.status = String(pred.status);
        this.createdAt = pred.createdAt;
        this.dateFin = new Date(pred.dateFin);
        this.options = pred.options || {};
        this.user_id = pred.user_id && pred.user_id._id ? String(pred.user_id._id) : String(pred.user_id);
        this.result = pred.result || '';
        this.pronostics_ia = pred.pronostics_ia || {};
    }
}
