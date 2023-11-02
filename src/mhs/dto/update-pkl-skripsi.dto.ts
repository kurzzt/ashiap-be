import { IsBoolean, IsNotEmpty, IsNumber, Max, Min, ValidateIf } from "class-validator";
import { Transform, Type } from "class-transformer";

export class UpdatePKLDto {
  // @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsNotEmpty()
  @IsBoolean()
  readonly passed: boolean
  
  @ValidateIf(o => o.passed == true)
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly nilai: number
}

export class UpdateSkripsiDto {
  // @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsNotEmpty()
  @IsBoolean()
  readonly passed: boolean
  
  @ValidateIf(o => o.passed == true)
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly nilai: number
}