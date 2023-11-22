import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserService } from 'src/user/user.service';

@ValidatorConstraint({ async: true })
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    private userService: UserService
  ) {}
  async validate(value: any, args: ValidationArguments) {
    const valid = await this.userService.isExistByEmail_sec(value).then(user => {
      if (user) return false;
      return true;
    })
    return valid
  }

  defaultMessage(args: ValidationArguments) {
    return 'Email $value already used. Choose another email.'
  }
}

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}