import { IsDefined, IsEmail, IsEnum, IsMobilePhone, IsNotEmpty, IsNumberString, IsString } from "class-validator";
import { POS, SEX, eduLev, jobStat } from "utils/global.enum";
import { IsEmailUnique } from "utils/uniqueMail.decorator";
import { IsNIPUnique } from "../uniqueNIP.decorator";

export class CreateDsnDto {
  @IsNotEmpty()
  @IsNumberString()
  @IsNIPUnique()
  readonly nip : string

  @IsNotEmpty()
  @IsString()
  readonly name : string
  
  @IsNotEmpty()
  @IsEmail()
  @IsEmailUnique()
  readonly email : string

  @IsNotEmpty()
  @IsEnum(SEX)
  readonly gender : string

  @IsNotEmpty()
  @IsEnum(POS)
  readonly position : string

  @IsNotEmpty()
  @IsEnum(eduLev)
  readonly eduLevel : string

  @IsNotEmpty()
  @IsEnum(jobStat)
  readonly jobStat : string

  @IsNotEmpty()
  @IsMobilePhone()
  readonly noTelp : string

  @IsDefined()
  @IsString()
  readonly address : string

  @IsNotEmpty()
  @IsString()
  readonly province : string

  @IsDefined()
  @IsString()
  readonly desc : string
}