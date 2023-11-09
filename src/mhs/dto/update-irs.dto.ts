import { IsNotEmpty, IsNumber, IsUrl, Max, Min } from "class-validator";

export class UpdateIRSDto {
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
  @Max(24)
  readonly sks: number
}