import { validate } from 'class-validator';
import { CreateUserDto } from '../../../src/user/dto/createuser.dto';

describe('CreateUserDto', () => {
    let dto: CreateUserDto;

    beforeEach(() => {
    });

    describe("username validation", () => {
        it('should pass when username is a valid non-empty string', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: 'StrongPass1!'});
            
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail when username is missing', async () => {
            dto = new CreateUserDto({motDePasse: 'StrongPass1!'});
            
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('username');
        });

        it('should fail when username is not a string', async () => {
            dto = new CreateUserDto({username: 123 as any, motDePasse: 'StrongPass1!'});
            
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('username');
        });

        it('should fail when username is an empty string', async () => {
            dto = new CreateUserDto({username: '', motDePasse: 'StrongPass1!'});
            
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('username');
        });
    });

    describe("motDePasse validation", () => {
        it('should pass when motDePasse meets strong password criteria', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: 'StrongPass1!'});
            
            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should fail when motDePasse is missing', async () => {
            dto = new CreateUserDto({username: 'validUser'});
            
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('motDePasse');
        });

        it('should fail when motDePasse is not a string', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: 12345678 as any});
            
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('motDePasse');
        });

        it('should fail when motDePasse is an empty string', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: ''});
            
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('motDePasse');
        });

        it('should fail when motDePasse is missing a number', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: 'WeakPass!'});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('motDePasse');
        });

        it('should fail when motDePasse is missing an uppercase letter', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: 'weakpass1!'});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('motDePasse');
        });

        it('should fail when motDePasse is missing a lowercase letter', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: 'WEAKPASS1!'});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('motDePasse');
        });

        it('should fail when motDePasse is missing a symbol', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: 'WeakPass1'});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('motDePasse');
        });

        it('should fail when motDePasse is too short', async () => {
            dto = new CreateUserDto({username: 'validUser', motDePasse: 'Wp1!'});

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('motDePasse');
        });
    });
});