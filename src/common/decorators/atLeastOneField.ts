import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AtLeastOneField(
  property: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneField',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as any;
          return property.some(
            (prop) => object[prop] !== undefined && object[prop] !== null,
          );
        },
        defaultMessage() {
          return `At least one of the following properties must be provided: ${property.join(', ')}`;
        },
      },
    });
  };
}
