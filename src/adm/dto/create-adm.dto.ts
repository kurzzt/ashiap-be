import { IsDefined, IsMobilePhone, IsNotEmpty, IsString } from "class-validator";

export class CreateAdmDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsMobilePhone()
  readonly noTelp: string;

  @IsDefined()
  @IsString()
  readonly address: string;

  @IsDefined()
  @IsString()
  readonly desc: string;
}