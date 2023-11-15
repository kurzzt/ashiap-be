import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { isValidObjectId } from "mongoose";
import { MhsService } from "./mhs.service";

@Injectable()
export class ValidateMhsParamId implements PipeTransform<string> {
  constructor(
    private mhsService: MhsService
  ){}
  
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    
    if (isValidObjectId(value)) {
      const user = await this.mhsService.validateParamId(value)
      if (!user) throw new BadRequestException(`Cant find Mahasiswa with ${value} IDs`)
      else return value
    }
    throw new BadRequestException('Please enter a corrent Mongo ID')

  };
}