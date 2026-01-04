import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsNotBeforeDate", async: false })
export class IsNotBeforeDateValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [property] = args.constraints;

    const relatedValue = (args.object as any)[property];

    if (!value ||!relatedValue) {
      return true; // Se o objeto ou a data de comparação não estiverem disponíveis, retorna true
    }

    const startDate = new Date(relatedValue);
    const endDate = new Date(value);

    if(isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false; // Datas inválidas
    }

    return endDate > startDate;
  }

  defaultMessage(args: ValidationArguments) {
    const [property] = args.constraints;
    return `The date must not be before '${property}'.`;
  }
}