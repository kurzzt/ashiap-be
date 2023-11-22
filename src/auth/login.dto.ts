import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  readonly identifier: string;
  
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}