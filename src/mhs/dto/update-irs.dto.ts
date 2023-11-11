import { IsNotEmpty, IsNumber, IsObject, IsUrl, Max, Min } from "class-validator";

export class UpdateIRSDto {
  @IsNotEmpty()
  @IsObject()
  readonly fileURL: FileObject

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(14)
  readonly semester: number
  
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(24)
  readonly sks: number
}