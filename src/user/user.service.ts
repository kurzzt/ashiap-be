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
var mongoose = require('mongoose');

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

  async createSecDB(id: Types.ObjectId, email: string, password: string) {
    const res = await this.secDBModel.create({ _id: id, email: email, password: password })
    return res
  }

  async validateByEmailSecDB(email: string) {
    const validate = await this.secDBModel.findOne({ email });
    return validate
  }

  async validateSecDB(id: string): Promise<secDB> {
    const validate = await this.secDBModel.findOne({ _id: new Types.ObjectId(id) })
    return validate
  }

  async createUsers(user: CreateUserDto) {
    const { name, noTelp, address, desc, email, role, userId } = user;
    const randomPass = faker.internet.password({ length: 12 }); // Randomized password
    const hashPass = await bcrypt.hash(randomPass, 10); // Hash

    let createuser: any

    if (role == ROLE.ADM || role == ROLE.DEPT) {

      if (role == ROLE.ADM) {
        createuser = await this.admService.createAdm({
          name, noTelp, address, desc
        });

      } else {
        createuser = await this.deptService.createDept({
          name, noTelp, address, desc
        });
      }

      // CREATE SEC
      const createSecUser = await this.secDBModel.create({
        _id: createuser._id,
        email: email,
        password: randomPass
      });

      // CREATE USER
      const createUser = await this.userModel.create({
        userId: createuser._id,
        email: email,
        password: hashPass,
        role: role
      });

      return createuser

    } else if (role == ROLE.MHS || role == ROLE.DSN) {
      const fecthSecDB = await this.secDBModel.findOne({ _id: new mongoose.Types.ObjectId(userId) })
      if (!fecthSecDB) throw new NotFoundException(`User with ${userId} IDs doesnt exist`)

      const validateUser = await this.userModel.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      if (validateUser) throw new BadRequestException(`User with ${userId} IDs already registered as user`)

      createuser = await this.userModel.create({
        userId: fecthSecDB._id,
        email: fecthSecDB.email,
        password: hashPass,
        role: role
      })

      return createuser
    }
  }

  async findAlluser(q: Query) {
    const filter: Record<string, any> = {
      role : String,
      search : ['email']
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const count = await this.userModel.countDocuments(params)
    const query = await this.userModel.find(params, '-__v').populate('userId', '_id name noTelp address desc active status check').limit(limit).skip(skip).sort(sort)
    const response = query.map(obj => flattenObject(obj))
    return new CoreResponseData(count, limit, response)
  }


  async findUserById(id: string) {
    const query = await this.userModel.findById(id, '-__v').populate('userId', '-__v -irs -pkl -skripsi')
    if (!query) throw new BadRequestException(`Cant find User with ${id} IDs`)

    const response = flattenObject(query)
    return response
  }

  private async deleteUserById(id: string): Promise<User> {
    const response = await this.userModel.findByIdAndDelete(id)
    return response
  }

  async deleteSecDBById(id: string) {
    const response = await this.secDBModel.findOneAndDelete({ _id: new Types.ObjectId(id) })
    return response
  }

  async deleteUser(id: string) {
    await this.findUserById(id)

    const { userId, role } = await this.deleteUserById(id)
    if (role == ROLE.ADM || role == ROLE.DEPT) {
      await this.deleteSecDBById(userId.toString())
    }
    if (role == ROLE.ADM) {
      await this.admService.deleteAdmById(userId.toString())
    } else if (role == ROLE.DEPT) {
      await this.deptService.deleteDeptById(userId.toString())
    }

    return { userId, role }
  }

  async deleteUserByUserId(id: string) {
    const response = await this.userModel.findOneAndDelete({ userId: new Types.ObjectId(id) })
    return response
  }

  async findByEmail(email: string): Promise<any>{
    const query = await this.userModel.findOne({ email }, '+password').populate('userId', 'name _id check')
    return flattenObject(query)
  }

  async findUser(id: string){
    return await this.userModel.findOne({userId: new Types.ObjectId(id)})
  }
}
