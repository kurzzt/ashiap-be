import { Injectable } from '@nestjs/common';
import { DEPT } from './schemas/dept.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDeptDto } from './dto/create-dept.dto';

@Injectable()
export class DeptService {
  constructor(
    @InjectModel(DEPT.name)
    private deptModel: Model<DEPT>
  ){}

  async createDept(dept: CreateDeptDto){
    const { name, noTelp, address, desc } = dept
    const response = await this.deptModel.create({
      name : name,
      noTelp: noTelp,
      address: address,
      desc: desc,
    })

    return response
  }


  async deleteDeptById(id: string){
    const response = await this.deptModel.findByIdAndDelete(id)
    return response
  }
}
