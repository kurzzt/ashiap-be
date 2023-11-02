import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { DsnService } from './dsn.service';

@ValidatorConstraint({ async: true })
export class IsNIPUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    private dsnService : DsnService
  ) {}
  async validate(value: any, args: ValidationArguments) {
    const valid = await this.dsnService.validateNIP(value).then(user => {
      if (user) return false;
      return true;
    })
    return valid
  }

  defaultMessage(args: ValidationArguments) {
    return 'NIP $value already exists.'
  }
}

export function IsNIPUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNIPUniqueConstraint,
    });
  };
}