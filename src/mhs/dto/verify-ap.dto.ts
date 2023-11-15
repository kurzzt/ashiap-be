import { IsBoolean, IsIn, IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { StatIRS } from "utils/global.enum";

export class VerifyIRSDto {
  @IsNotEmpty()
  @IsIn([StatIRS.VERIFIED, StatIRS.FAILED])
  readonly status: string

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(14)
  readonly semester: number
}

export class VerifyKHSDto {
  @IsNotEmpty()
  @IsIn([StatIRS.VERIFIED, StatIRS.FAILED])
  readonly status: string
  
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(14)
  readonly semester: number
}

export class VerifyPKLDto {
  @IsNotEmpty()
  @IsBoolean()
  readonly passed: boolean
}

export class VerifySkripsiDto {
  @IsNotEmpty()
  @IsBoolean()
  readonly passed: boolean
}