import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsAgeRange", async: false })
export class AgeRangeValidator implements ValidatorConstraintInterface {
  validate(dateOfBirth: string, args: ValidationArguments) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    if (isNaN(birthDate.getTime())) {
      return false; // Invalid date format
    }

    const [minAge = 0, maxAge = 100] = args.constraints;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= minAge && age <= maxAge;
  }

  defaultMessage(args: ValidationArguments) {
    const [minAge = 0, maxAge = 100] = args.constraints;
    return `The age must be between ${minAge} and ${maxAge} years.`;
  }
}
