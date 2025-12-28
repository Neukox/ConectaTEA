import { ValidationOptions, registerDecorator } from "class-validator";
import { AgeRangeValidator } from "../validators/age-range.validator";

/**
 * Decorator para validar se a idade calculada a partir da data de nascimento em um intervalo específico.
 */
export function IsAgeRange(
  minAge = 0,
  maxAge = 100,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsAgeRange",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minAge, maxAge],
      options: validationOptions,
      validator: AgeRangeValidator,
    });
  };
}
