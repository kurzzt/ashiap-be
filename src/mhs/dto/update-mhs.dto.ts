import { IsDefined, IsEmail, IsEnum, IsMobilePhone, IsNotEmpty, IsObject, IsString, MinLength } from "class-validator";
import { AR, SEX } from "../../../utils/global.enum";
import { FileObject } from "utils/globals";
import { IsEmailUnique } from "utils/uniqueMail.decorator";

export class UpdateMhsDto {
  @IsNotEmpty()
  @IsEmail()
  @IsEmailUnique()
  readonly email: string
  
  @IsNotEmpty()
  @IsEnum(AR)
  readonly AR: string

  @IsNotEmpty()
  @IsEnum(SEX)
  readonly gender : string

  @IsDefined()
  @IsString()
  readonly address: string

  @IsNotEmpty()
  @IsString()
  readonly province: string

  @IsNotEmpty()
  @IsMobilePhone()
  readonly noTelp: string

  @IsNotEmpty()
  @IsObject()
  readonly photoURL: FileObject
  
  @IsNotEmpty()
  @MinLength(12)
  readonly password: string
}