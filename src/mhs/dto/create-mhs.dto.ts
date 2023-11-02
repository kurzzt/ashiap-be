import { IsDefined, IsEmail, IsEnum, IsMobilePhone, IsMongoId, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";
import { SEX, StatMhs, AR } from "../../../utils/global.enum";
import { ObjectId } from 'mongoose';
import { IsEmailUnique } from "utils/uniqueMail.decorator";
import { IsNIMUnique } from "../uniqueNIM.decorator";

export class CreateMhsDto {
  @IsNotEmpty()
  @IsNumberString()
  @IsNIMUnique()
  readonly nim: string

  @IsNotEmpty()
  @IsString()
  readonly name: string

  @IsNotEmpty()
  @IsEnum(SEX)
  readonly gender : string

  @IsNotEmpty()
  @IsEmail()
  @IsEmailUnique()
  readonly email: string

  @IsDefined()
  @IsString()
  readonly address: string

  @IsNotEmpty()
  @IsString()
  readonly province: string

  @IsNotEmpty()
  @IsNumber()
  readonly YoE: number
  
  @IsNotEmpty()
  @IsEnum(AR)
  readonly AR: string

  @IsNotEmpty()
  @IsMobilePhone()
  readonly noTelp: string

  @IsNotEmpty()
  @IsEnum(StatMhs)
  readonly status: string

  @IsDefined()
  @IsString()
  readonly desc: string

  @IsNotEmpty()
  @IsMongoId()
  readonly dosWal: ObjectId
}