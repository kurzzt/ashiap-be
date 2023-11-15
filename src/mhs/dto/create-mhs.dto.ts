import { IsDefined, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";
import { StatMhs, AR } from "../../../utils/global.enum";
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
  @IsEmail()
  @IsEmailUnique()
  readonly email: string

  @IsNotEmpty()
  @IsNumber()
  readonly YoE: number
  
  @IsNotEmpty()
  @IsEnum(AR)
  readonly AR: string

  @IsNotEmpty()
  @IsEnum(StatMhs)
  readonly status: string

  @IsDefined()
  @IsString()
  readonly desc: string

  @IsNotEmpty()
  @IsMongoId()
  readonly dosWalName: ObjectId
}