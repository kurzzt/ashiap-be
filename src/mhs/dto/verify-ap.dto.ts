import { IsIn, IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { StatAP } from "utils/global.enum";

export class VerifyIRSDto {
  @IsNotEmpty()
  @IsIn([StatAP.VERIFIED, StatAP.FAILED])
  readonly status: string

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(14)
  readonly semester: number
}

export class VerifyKHSDto {
  @IsNotEmpty()
  @IsIn([StatAP.VERIFIED, StatAP.FAILED])
  readonly status: string
  
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(14)
  readonly semester: number
}

export class VerifyPKLDto {
  @IsNotEmpty()
  @IsIn([ StatAP.VERIFIED, StatAP.FAILED])
  readonly isVerified: string
}

export class VerifySkripsiDto {
  @IsNotEmpty()
  @IsIn([ StatAP.VERIFIED, StatAP.FAILED])
  readonly isVerified: string
}