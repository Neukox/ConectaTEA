import { ValidatorOptions, registerDecorator } from "class-validator";
import { BrazilianPhoneValidator } from "../validators/brasilian-phone.validator";

/**
 * Decorator para validar se um número de telefone é um número brasileiro válido.
 */
export function IsBrazilianPhone(validationOptions?: ValidatorOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "IsBrazilianPhone",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BrazilianPhoneValidator,
    });
  };
}
