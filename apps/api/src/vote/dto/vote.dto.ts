import { Vote } from '../vote.schema';

export class VoteDto {
    _id: string;
    amount: number;
    prediction_id: string;
    option: string;
    date: Date;
    user_id: string;

    constructor(v: Vote){
        this._id = v._id;
        this.amount = v.amount;
        this.prediction_id = String(v.prediction_id);
        this.option = v.option;
        this.date = v.date;
        this.user_id = String(v.user_id);
    }
}
