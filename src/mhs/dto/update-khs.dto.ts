import { IsNotEmpty, IsNumber, IsObject, IsUrl, Max, Min } from "class-validator";

export class UpdateKHSDto {
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
  @Max(4)
  readonly ipk: number
}