import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsStringOrArrayString(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isStringOrArrayString',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typeof value === 'string' || Array.isArray(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} должно быть строкой либо массивом строк`;
                },

            },
        });
    };
}