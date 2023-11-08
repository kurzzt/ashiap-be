import { IsBoolean, IsNotEmpty, IsNumber, IsUrl, Max, Min, ValidateIf } from "class-validator";

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
  @IsUrl()
  readonly fileURL: string
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
  @IsUrl()
  readonly fileURL: string
}