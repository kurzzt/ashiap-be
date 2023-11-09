import { IsNotEmpty, IsNumber, IsUrl, Max, Min } from "class-validator";

export class UpdateKHSDto {
  @IsNotEmpty()
  // @IsUrl()
  readonly fileURL: string

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(14)
  readonly sem: number
  
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(4)
  readonly ipk: number
}