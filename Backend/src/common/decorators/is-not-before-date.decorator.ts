import { ValidatorOptions, registerDecorator } from "class-validator";
import { IsNotBeforeDateValidator } from "../validators/is-not-before-date.validator";

/**
 * Decorator para validar se uma data é posterior a outra ou não
 */
export function IsNotBeforeDate(
  property: string,
  validationOptions?: ValidatorOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsNotBeforeDate",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsNotBeforeDateValidator,
    });
  };
}
