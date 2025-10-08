export type PredictionStatus = 'waiting' | 'valid' | 'invalid';


export interface Prediction {
    _id: string;
    title: string;
    description: string;
    status: PredictionStatus;
    dateFin: Date;
    options: Record<string, number>;
    user_id: string;
    result: string;
}