import { ValidatorOptions, registerDecorator } from "class-validator";
import { IsNotPastDateValidator } from "../validators/is-not-past-date.validator";

/**
 * Decorator para validar se umaq data é do passado.
 */
export function IsNotPastDate(validationOptions?: ValidatorOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsNotPastDate",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotPastDateValidator,
    });
  };
}
