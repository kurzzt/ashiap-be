import { IsDefined, IsEmail, IsEnum, IsMobilePhone, IsMongoId, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { ROLE } from "utils/global.enum";
import { IsEmailUnique } from "utils/uniqueMail.decorator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsEnum(ROLE)
  readonly role: string;
  
  @ValidateIf(o => (o.role == ROLE.ADM || o.role == ROLE.DEPT))
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ValidateIf(o => (o.role == ROLE.ADM || o.role == ROLE.DEPT))
  @IsNotEmpty()
  @IsMobilePhone()
  readonly noTelp: string;

  @ValidateIf(o => (o.role == ROLE.ADM || o.role == ROLE.DEPT))
  @IsDefined()
  @IsString()
  readonly address: string;
  
  @ValidateIf(o => (o.role == ROLE.ADM || o.role == ROLE.DEPT))
  @IsDefined()
  @IsString()
  readonly desc: string;

  @ValidateIf(o => (o.role == ROLE.ADM || o.role == ROLE.DEPT))
  @IsEmailUnique()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
  
  @ValidateIf(o => (o.role == ROLE.MHS || o.role == ROLE.DSN))
  @IsNotEmpty()
  @IsMongoId()
  readonly user: string;
}