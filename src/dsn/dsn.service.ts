import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DSN } from './schemas/dsn.schema';
import { Model } from 'mongoose';
import { CreateDsnDto } from './dto/create-dsn.dto';
import { UserService } from 'src/user/user.service';
import { faker } from '@faker-js/faker';
import { Query } from 'express-serve-static-core';
import { genParam } from 'utils/filter';
import { CoreResponseData } from 'utils/CoreResponseData';

@Injectable()
export class DsnService {
  constructor(
    @InjectModel(DSN.name)
    private dsnModel: Model<DSN>,
    private userService: UserService,
  ) { }

  async validateNIP(nip: string){ return await this.dsnModel.findOne({ nip }) }
  async isExist(id: string){ return await this.dsnModel.findById(id)}

  async createDsn(dsn: CreateDsnDto){
    const {
      nip, name, email, gender, position,
      eduLevel, jobStat, noTelp, address,
      province, desc, photoURL } = dsn

    const createDsn = await this.dsnModel.create({
      nip, name, gender, position, eduLevel, jobStat, noTelp, address, province, desc, 
      photoURL : photoURL.preview
    })

    const randomPass = faker.internet.password({ length: 12 })
    await this.userService.createUser_sec(createDsn._id, email, randomPass)
    return createDsn
  }

  async listDsn(q: Query) {
    const filter: Record<string, any> = {
      position : String,
      eduLevel : String, 
      jobStat : String,
      active: Boolean,
      search : ['name','nip']
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const count = await this.dsnModel.countDocuments(params)
    const response = await this.dsnModel.find(params).limit(limit).skip(skip).sort(sort)
    return new CoreResponseData(count, limit, response)
  }

  async findDsn(id: string): Promise<DSN>{
    const response = await this.dsnModel.findById(id)
    if(response) return response
    else throw new BadRequestException(`Cant find User with ${id} IDs`)
  }

  private async arrayOfDsnActiveId() {
    const arrOfObjId = await this.dsnModel.find({ active: true }, '_id')
    const response = arrOfObjId.map(item => item._id.toString());

    return response
  }

  async deleteDsn(id: string){
    const validate = await this.isExist(id)
    if (!validate) throw new BadRequestException(`Cant find User with ${id} IDs`)

    try {
      // const arrayofDsn = await this.arrayOfDsnActiveId()
      // const filteredArray = arrayofDsn.filter(dsnId => dsnId !== id);
      // if (filteredArray.length === 0) {
      //   throw new BadRequestException(`Tidak ada dosen lain yang tersedia.`);
      // }
      // const randomDsnId = filteredArray[Math.floor(Math.random() * filteredArray.length)];
      // await this.mhsService.moveManyMhsToOtherDsn(id, randomDsnId)

      await this.userService.deleteByUser(id)
      await this.userService.delete_sec(id)
      const response = await this.dsnModel.findByIdAndDelete(id)
      return response

    } catch (err) {
      throw new BadRequestException()
    }
  }
}
