import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsObject, Max, Min, ValidateIf } from "class-validator";
import { FileObject } from "utils/globals";

export class UpdatePKLDto {
  @IsNotEmpty()
  @IsBoolean()
  readonly passed: boolean

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly nilai: number

  @ValidateIf(o => o.passed == true)
  @IsNotEmpty()
  @IsDateString()
  readonly lulusAt: Date

  @IsNotEmpty()
  @IsObject()
  readonly fileURL: FileObject
}

export class UpdateSkripsiDto {
  @IsNotEmpty()
  @IsBoolean()
  readonly passed: boolean

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly nilai: number

  @ValidateIf(o => o.passed == true)
  @IsNotEmpty()
  @IsDateString()
  readonly lulusAt: Date

  @IsNotEmpty()
  @IsObject()
  readonly fileURL: FileObject
}