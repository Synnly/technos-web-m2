import { Cosmetic } from '../cosmetic.schema';

export class CosmeticDto {
    _id: string;
    name: string;
    cost: number;
    type: string;
    value: string;
    owned?: boolean;

    constructor(c: Cosmetic) {
        this._id = c._id;
        this.name = c.name;
        this.cost = c.cost;
        this.type = c.type;
        this.value = c.value;
        this.owned = c.owned ?? false;
    }
}
