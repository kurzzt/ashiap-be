import { IsDefined, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";
import { StatMhs } from "../../../utils/global.enum";
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
  @IsNumber()
  readonly YoE: number

  @IsNotEmpty()
  @IsEnum(StatMhs)
  readonly status: string

  @IsDefined()
  @IsString()
  readonly desc: string

  @IsNotEmpty()
  @IsMongoId()
  readonly doswal_id: string
}