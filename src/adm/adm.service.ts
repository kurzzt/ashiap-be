import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ADM } from './schemas/adm.schema';
import { Model } from 'mongoose';
import { CreateAdmDto } from './dto/create-adm.dto';

@Injectable()
export class AdmService {
  constructor(
    @InjectModel(ADM.name)
    private admModel: Model<ADM>
  ){}

  async createAdm(adm : CreateAdmDto){
    const { name, noTelp, address, desc } = adm
    const response = await this.admModel.create({
      name : name,
      noTelp: noTelp,
      address: address,
      desc: desc,
    })
    
    return response
  }

  async deleteAdmById(id: string){
    const response = await this.admModel.findByIdAndDelete(id)
    return response
  }
}