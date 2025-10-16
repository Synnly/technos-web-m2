import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

/**
 * DTO pour la création d'un nouvel utilisateur.
 */
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 })
    motDePasse: string;

    constructor(partial: Partial<CreateUserDto>) {
        Object.assign(this, partial);
    }
}