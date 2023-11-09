import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DSN } from './schemas/dsn.schema';
import { Model } from 'mongoose';
import { CreateDsnDto } from './dto/create-dsn.dto';
import { UserService } from 'src/user/user.service';
import { faker } from '@faker-js/faker';
import { Query } from 'express-serve-static-core';
import { genParam } from 'utils/filter';
// import { MhsService } from 'src/mhs/mhs.service';

@Injectable()
export class DsnService {
  constructor(
    @InjectModel(DSN.name)
    private dsnModel: Model<DSN>,
    private userService: UserService,
    // private mhsService: MhsService
  ) { }

  async validateNIP(nip: string){ return await this.dsnModel.findOne({ nip }) }

  async createDsn(dsn: CreateDsnDto){
    try {
      const {
        nip, name, email, gender, position,
        eduLevel, jobStat, noTelp, address,
        province, desc } = dsn

      const createDsn = await this.dsnModel.create({
        nip, name, gender, position,
        eduLevel, jobStat, noTelp, address,
        province, desc,
      })

      const randomPass = faker.internet.password({ length: 12 }); // Randomized password
      const createSecDsn = await this.userService.createSecDB(createDsn._id, email, randomPass)

      return createDsn
    } catch (err) {
      throw new BadRequestException()
    }
  }

  async findAllDsn(q: Query) {
    const filter: Record<string, any> = {
      position : String,
      eduLevel : String, 
      jobStat : String,
      active: Boolean,
      search : ['name','nip']
    }

    const { limit, skip, params } = genParam(q, filter)
    const count = await this.dsnModel.countDocuments()
    const response = await this.dsnModel.find({ ...params }, 'nip name position eduLevel jobStat active createdAt').limit(limit).skip(skip)
    return { total: count, totalPage: Math.ceil(count / limit), data: response }
  }

  async findDsnById(id: string): Promise<DSN>{
    const response = await this.dsnModel.findById(id, '-__v')
    if(response) return response
    else throw new BadRequestException(`Cant find User with ${id} IDs`)
  }

  private async arrayOfDsnActiveId() {
    const arrOfObjId = await this.dsnModel.find({ active: true }, '_id')
    const response = arrOfObjId.map(item => item._id.toString());

    return response
  }

  async deleteDsnById(id: string){
    const validate = await this.findDsnById(id)
    if (!validate) throw new BadRequestException(`Cant find User with ${id} IDs`)

    try {
      // const arrayofDsn = await this.arrayOfDsnActiveId()
      // const filteredArray = arrayofDsn.filter(dsnId => dsnId !== id);
      // if (filteredArray.length === 0) {
      //   throw new BadRequestException(`Tidak ada dosen lain yang tersedia.`);
      // }
      // const randomDsnId = filteredArray[Math.floor(Math.random() * filteredArray.length)];
      // await this.mhsService.moveManyMhsToOtherDsn(id, randomDsnId)

      await this.userService.deleteUserByUserId(id)
      await this.userService.deleteSecDBById(id)
      const response = await this.dsnModel.findByIdAndDelete(id)
      return response

    } catch (err) {
      throw new BadRequestException()
    }
  }
}
