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

    constructor(pred: Prediction) {
        this._id = pred._id;
        this.title = pred.title;
        this.description = pred.description;
        this.status = pred.status;
        this.createdAt = pred.createdAt;
        this.dateFin = pred.dateFin;
        this.options = pred.options || {};
        this.user_id = String(pred.user_id);
        this.result = pred.result || '';
        this.pronostics_ia = pred.pronostics_ia || {};
    }
}
