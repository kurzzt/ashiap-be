import { IsNotEmpty, IsNumber, IsObject, Max, Min } from "class-validator";
import { FileObject } from "utils/globals";

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
  readonly khsIpk: number
}