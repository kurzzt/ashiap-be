import { IsBoolean, IsNotEmpty, IsNumber, IsObject, Max, Min, ValidateIf } from "class-validator";
import { FileObject } from "utils/globals";

export class UpdatePKLDto {
  // @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsNotEmpty()
  @IsBoolean()
  readonly passed: boolean
  
  @ValidateIf(o => o.passed == true)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly nilai: number

  @ValidateIf(o => o.passed == true)
  @IsNotEmpty()
  @IsObject()
  readonly fileURL: FileObject
}

export class UpdateSkripsiDto {
  // @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsNotEmpty()
  @IsBoolean()
  readonly passed: boolean
  
  @ValidateIf(o => o.passed == true)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly nilai: number

  @ValidateIf(o => o.passed == true)
  @IsNotEmpty()
  @IsObject()
  readonly fileURL: FileObject
}