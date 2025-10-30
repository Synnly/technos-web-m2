import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";

export function IsFutureDate(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "isFutureDate",
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any, _args: ValidationArguments) {
					if (!value) return false;
					const date = value instanceof Date ? value : new Date(value);
					if (isNaN(date.getTime())) return false;
					const toleranceMs = 10 * 1000;
					const now = new Date();
					const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

					return date.getTime() + toleranceMs >= todayMidnight;
				},
				defaultMessage() {
					return "date must be a valid Date not earlier than now";
				},
			},
		});
	};
}
