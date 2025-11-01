import { Publication } from '../publication.schema';

export class PublicationDto {
    _id: string;
    message: string;
    datePublication: Date;
    prediction_id: string;
    parentPublication_id?: string;
    user_id: string;
    likes: string[];

    constructor(p: Publication) {
        this._id = p._id;
        this.message = p.message;
        this.datePublication = p.datePublication;
        this.prediction_id = String(p.prediction_id);
        this.parentPublication_id = String(p.parentPublication_id);
        this.user_id = String(p.user_id);
        this.likes = (p.likes || []).map((l: any) => (l && l._id ? String(l._id) : String(l)));
    }
}
