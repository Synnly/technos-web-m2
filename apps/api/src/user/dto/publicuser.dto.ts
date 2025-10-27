import { User } from "../user.schema";

/**
 * DTO pour transférer les données utilisateur publiques..
 */
export class PublicUserDto {
    _id: string;
    username: string;

    constructor(user: User) {
        this._id = user._id;
        this.username = user.username;
    }
}
