import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsNotPastDate", async: false })
export class IsNotPastDateValidator implements ValidatorConstraintInterface {
  validate(date: string | Date) {
    if (!date) {
      return true; // Se o objeto ou a data de comparação não estiverem disponíveis, retorna true
    }

    const actualDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas a data

    return actualDate >= today;
  }

  defaultMessage(args: ValidationArguments) {
    return `The date must not be in the past.`;
  }
}
