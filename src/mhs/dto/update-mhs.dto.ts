import { IsDefined, IsEnum, IsMobilePhone, IsNotEmpty, IsObject, IsString } from "class-validator";
import { SEX } from "../../../utils/global.enum";
import { FileObject } from "utils/globals";

export class UpdateMhsDto {
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
}