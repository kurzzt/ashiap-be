import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class UpdateKHSDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(14)
  readonly sem: number
  
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(4)
  readonly ipk: number
}