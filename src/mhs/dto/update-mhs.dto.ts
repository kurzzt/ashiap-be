import { IsDefined, IsEnum, IsMobilePhone, IsNotEmpty, IsString } from "class-validator";
import { SEX } from "../../../utils/global.enum";

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
}