import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { DDDs_BR } from "../constants/phone.constant";

@ValidatorConstraint({ name: "IsBrazilianPhone", async: false })
export class BrazilianPhoneValidator implements ValidatorConstraintInterface {
  validate(phoneNumber: string, args: ValidationArguments) {
    if(!phoneNumber) return false;

    // Remove non-digit characters
    const digits = phoneNumber.replace(/\D/g, "");

    const ddd = parseInt(digits.slice(0, 2));
    const existingDDD = DDDs_BR.includes(ddd);

    if (!existingDDD) {
      return false;
    }

    const phoneFormats = [
      /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, // (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      /^\d{2}\s?\d{4,5}-?\d{4}$/, // XX XXXXX-XXXX ou XX XXXX-XXXX
      /^\d{10,11}$/, // XXXXXXXXXX ou XXXXXXXXXXX
    ];

    return phoneFormats.some((regex) => regex.test(phoneNumber));
  }

  defaultMessage(args: ValidationArguments) {
    return "Phone number must be a valid Brazilian phone number.";
  }
}
