import { faker } from '@faker-js/faker';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Query } from 'express-serve-static-core';
import { Model, Types } from 'mongoose';
import { AdmService } from 'src/adm/adm.service';
import { flattenObject } from 'utils/common';
import { genParam } from 'utils/filter';
import { ROLE } from 'utils/global.enum';
import { DeptService } from './../dept/dept.service';
import { CreateUserDto } from './dto/create-user.dto';
import { secDB } from './schemas/secDB.schema';
import { User } from './schemas/user.schema';
import { CoreResponseData } from 'utils/CoreResponseData';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(secDB.name)
    private secDBModel: Model<secDB>,
    private admService: AdmService,
    private deptService: DeptService,
  ) { }

  async isExist(id: string) { return this.userModel.findById(id) }
  async isExistByUser(user: string) { return this.userModel.findOne({ user: new Types.ObjectId(user) }) }
  async deleteByUser(user: string){ return await this.userModel.findOneAndDelete({ user: new Types.ObjectId(user) }) }
  
  async delete_sec(id: string) { return await this.secDBModel.findOneAndDelete({ _id: new Types.ObjectId(id) }) }
  async isExist_sec(id: string) { return this.secDBModel.findOne({ _id: new Types.ObjectId(id) }) }
  async createUser_sec(id: Types.ObjectId, password: string, email?: string) { return await this.secDBModel.create({ _id: id, email, password }) }
  async isExistByEmail_sec(email: string){ return await this.secDBModel.findOne({ email }) }
  async isExistById_sec(id: string){ return await this.secDBModel.findOne({ _id: new Types.ObjectId(id) }) }

  async createUser_mhs(user: Types.ObjectId, password: any){ return await this.userModel.create({ user, password, role: ROLE.MHS}) }

  async createUser(body: CreateUserDto) {
    const { name, noTelp, address, desc, email, role, user } = body
    const randomPass = faker.internet.password({ length: 12 }) // Randomized password
    const hashPass = await bcrypt.hash(randomPass, 10) // Hash

    let createuser: any

    if (role == ROLE.ADM || role == ROLE.DEPT) {
      if (role == ROLE.ADM) createuser = await this.admService.createAdm({ name, noTelp, address, desc })
      else createuser = await this.deptService.createDept({ name, noTelp, address, desc })
      
      await this.createUser_sec(createuser._id, email, randomPass)

      await this.userModel.create({
        user: createuser._id,
        password: hashPass,
        email, role
      })

      return createuser

    } else if (role == ROLE.MHS || role == ROLE.DSN) {
      const isExist_sec = await this.isExist_sec(user)
      if (!isExist_sec) throw new NotFoundException(`User with ${user} IDs doesnt exist`)

      const isExistByUser = await this.isExistByUser(user)
      if (isExistByUser) throw new BadRequestException(`User with ${user} IDs already registered as user`)

      createuser = await this.userModel.create({
        user: isExist_sec._id,
        email: isExist_sec.email,
        password: hashPass,
        role
      })

      return createuser
    }
  }

  // FIXME: query on populated field?
  async listUser(q: Query) {
    const filter: Record<string, any> = {
      role: String,
      search: ['email']
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const count = await this.userModel.countDocuments(params)
    const query = await this.userModel.find(params).populate('user', '_id name noTelp address desc active status').limit(limit).skip(skip).sort(sort)
    const response = query.map(obj => flattenObject(obj))
    return new CoreResponseData(count, limit, response)
  }

  // FIXME: validate user?
  async findUser(id: string) {
    const query = await this.userModel.findById(id).populate('user', '_id name noTelp address desc active status')
    if (!query) throw new BadRequestException(`Cant find User with ${id} IDs`)

    return flattenObject(query)
  }

  async deleteUser(id: string) {
    const isExist = await this.isExist(id)
    if (!isExist) throw new BadRequestException(`Cant find User with ${id} IDs`)

    const { user, role } = await this.userModel.findByIdAndDelete(id)
    if (role == ROLE.ADM || role == ROLE.DEPT) await this.delete_sec(user.toString())
    if (role == ROLE.ADM) await this.admService.deleteAdmById(user.toString())
    else if (role == ROLE.DEPT) await this.deptService.deleteDeptById(user.toString())

    return { user, role }
  }

  async login(identifier: string){
    const query = await this.userModel.findOne({ email: identifier }, '+password').populate('user', 'name _id check')
    return flattenObject(query)
  }

  async debug(identifier: string){
    return await this.userModel.aggregate([

    ])
  }
}
