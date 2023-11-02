import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { MhsService } from './mhs.service';

@ValidatorConstraint({ async: true })
export class IsNIMUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    private mhsService : MhsService
  ) {}
  async validate(value: any, args: ValidationArguments) {
    const valid = await this.mhsService.validateNIM(value).then(user => {
      if (user) return false;
      return true;
    })
    return valid
  }

  defaultMessage(args: ValidationArguments) {
    return 'NIM $value already exists.'
  }
}

export function IsNIMUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNIMUniqueConstraint,
    });
  };
}