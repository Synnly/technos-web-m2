import { ValidateBy, ValidationOptions } from "class-validator";

export function IsStringOrNull(validationOptions?: ValidationOptions) {
    return ValidateBy(
        {
            name: 'isStringOrNull',
            validator: {
                validate: (value: any) => {
                    if (Array.isArray(value)) {
                        return value.every(item => typeof item === 'string' || item === null);
                    }
                    return typeof value === 'string' || value === null;
                },
                defaultMessage: () => 'Each element must be a string or null',
            },
        },
        validationOptions,
    );
}