import { faker } from '@faker-js/faker';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as csv from 'csv-parser';
import { Query } from 'express-serve-static-core';
import { Model, PipelineStage, Types } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CoreResponseData } from 'utils/CoreResponseData';
import { flattenObject } from 'utils/common';
import { genParam } from 'utils/filter';
import { ROLE, StatAP } from 'utils/global.enum';
import { CreateMhsDto } from './dto/create-mhs.dto';
import { UpdateIRSDto, UpdateKHSDto } from './dto/update-irs-khs.dto';
import { UpdateMhsDto } from './dto/update-mhs.dto';
import { UpdatePKLDto, UpdateSkripsiDto } from './dto/update-pkl-skripsi.dto';
import { VerifyIRSDto, VerifyKHSDto, VerifyPKLDto, VerifySkripsiDto } from './dto/verify-ap.dto';
import { IRS } from './schemas/irs.schema';
import { MHS } from './schemas/mhs.schema';
import { PKL, Skripsi } from './schemas/pkl-skripsi.schema';
import { DsnService } from 'src/dsn/dsn.service';
import { UserEntity } from 'utils/globals';

import * as bcrypt from 'bcrypt';
import toStream = require('buffer-to-stream');

@Injectable()
export class MhsService {
  constructor(
    @InjectModel(MHS.name)
    private mhsModel: Model<MHS>,
    @InjectModel(IRS.name)
    private irsModel: Model<IRS>,
    @InjectModel(PKL.name)
    private pklModel: Model<PKL>,
    @InjectModel(Skripsi.name)
    private skripsiModel: Model<Skripsi>,
    private userService: UserService,
    private dsnService: DsnService
  ) { }

  async validateNIM(nim: string) { return await this.mhsModel.findOne({ nim }) }
  async validateParamId(id: string) { return await this.mhsModel.findById(id) }
  async isExist(id: string) { return await this.mhsModel.findById(id) }

  // =========================================
  // NOTE: CREATE
  // =========================================

  private async createIRS(semester: number) {
    return await this.irsModel.create({
      semester,
      khs: { ipk: null, fileURL: "", status: StatAP.NOT_UPLOADED }
    })
  }

  async createPKLMhs(id: string) {
    const { pkl } = await this.mhsModel.findById(id)
    if (pkl) throw new BadRequestException(`User with ${id} IDs already take PKL`)
    // FIXME: dont send throw new error, send data with defined format
    const haveRights = await this.currSKS(id)
    if (haveRights < 100) throw new BadRequestException(`You can't' take the PKL. Your SKS are below 100, namely ${haveRights}`)

    const { _id } = await this.pklModel.create({})
    const data = await this.mhsModel.findByIdAndUpdate(id, { pkl: _id }, { new: true, runValidators: true })
    return { haveRights: !!(haveRights < 100), data }
  }

  async createSkripsiMhs(id: string) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (skripsi) throw new BadRequestException(`User with ${id} IDs already take Skripsi`)

    // FIXME: dont send throw new error, send data with defined format
    const haveRights = await this.currSKS(id)
    if (haveRights < 120) throw new BadRequestException(`You can't' take the Skripsi. Your SKS are below 120, namely ${haveRights}`)

    const { _id } = await this.skripsiModel.create({})
    const data = await this.mhsModel.findByIdAndUpdate(id, { skripsi: _id }, { new: true, runValidators: true })
    return { haveRights: !!(haveRights < 120), data }
  }

  async createMhs(mhs: CreateMhsDto) {
    const { nim, name, YoE, status, desc, doswal_id } = mhs

    const validateDosWal = await this.userService.isExist_sec(doswal_id.toString())
    if (!validateDosWal) throw new NotFoundException(`Cant find the DosWal with ${doswal_id} IDs`)

    let irsLot = []
    for (let i = 1; i < 15; i++) {
      const newIRS = await this.createIRS(i)
      irsLot.push(newIRS._id)
    }

    const createMhs = await this.mhsModel.create({
      nim, name, YoE, status, desc,
      irs: irsLot,
      doswal: validateDosWal._id
    })

    const randomPass = faker.internet.password({ length: 12 })
    const hashPass = await bcrypt.hash(randomPass, 10)
    await this.userService.createUser_sec(createMhs._id, "", randomPass)
    await this.userService.createUser_mhs(createMhs._id, hashPass)

    return createMhs
  }

  async bulkDataMhs(file: Express.Multer.File) {
    try {
      const csvData = await this.parseCsvToJSON(file);
      console.log(csvData)
      const MHSs = await this.mhsModel.insertMany(csvData)
      for (const mhs of MHSs) {
        const id = mhs._id

        let irsLot = []
        for (let i = 1; i < 15; i++) {
          const newIRS = await this.createIRS(i)
          irsLot.push(newIRS._id)
        }

        await this.mhsModel.findByIdAndUpdate(id, {
          $set: { irs: irsLot },
        });

      }
      return MHSs

    } catch (err) {
      throw new BadRequestException(`${err}`)
    }
  }

  // =========================================
  // NOTE: UPDATE
  // =========================================

  async updateMhs(id: string, body: UpdateMhsDto) {
    const { email, AR, gender, address, province, noTelp, photoURL } = body
    const response = await this.mhsModel.findByIdAndUpdate(
      id,
      {
        AR, gender, address, province, noTelp,
        photoURL: photoURL.preview,
        check: true
      }, { new: true, runValidators: true }
    )

    await this.userService.updateUser_mhs((response._id).toString(), email)
    return response
  }

  async updateIRSMhs(id: string, body: UpdateIRSDto) {
    const { fileURL, sks, semester } = body
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.findByIdAndUpdate(
      irs[semester - 1].toString(),
      {
        status: StatAP.UNVERIFIED,
        sks: sks,
        fileURL: fileURL.preview
      }, { new: true, runValidators: true }
    )

    return response
  }

  async updateKHSMhs(id: string, body: UpdateKHSDto) {
    const { fileURL, ipk, semester } = body
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.findByIdAndUpdate(
      irs[semester - 1].toString(),
      {
        $set: {
          'khs.status': StatAP.UNVERIFIED,
          'khs.ipk': ipk,
          'khs.fileURL': fileURL.preview
        }
      }, { new: true, runValidators: true }
    )

    return response
  }

  //FIXME: isverified flow
  async updatePKL(id: string, body: UpdatePKLDto) {
    const { pkl } = await this.mhsModel.findById(id)
    if (!pkl) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the PKL`)

    let response: Object
    if (body.passed) {
      response = await this.pklModel.findByIdAndUpdate(pkl.toString(), {
        passed: true,
        nilai: body.nilai,
        fileURL: body.fileURL.preview,
        lulusAt: new Date(),
        isVerified: false,
      }, { new: true, runValidators: true })
      return response
    } else {
      const response = await this.pklModel.findByIdAndUpdate(pkl.toString(), { passed: false }, { new: true, runValidators: true })
      return response
    }
  }

  //FIXME: isverified flow
  async updateSkripsi(id: string, body: UpdateSkripsiDto) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the Skripsi`)

    const { passed } = body
    if (passed) {
      const { passed, nilai, lulusAt, fileURL } = body
      const response = await this.skripsiModel.findByIdAndUpdate(skripsi.toString(), {
        passed, nilai, lulusAt,
        fileURL: body.fileURL.preview,
      }, { new: true, runValidators: true })
      return response
    } else {
      return await this.skripsiModel.findByIdAndUpdate(skripsi.toString(), { passed: false }, { new: true, runValidators: true })
    }
  }

  // =========================================
  // NOTE: FIND
  // =========================================

  // passed_skripsi=true
  // verified_skripsi=Unverified (special case)
  async listMhs(q: Query) {
    const filter: Record<string, any> = {
      YoE: Number,
      AR: String,
      status: String,
      doswal: Object,
      gender: String,
      search: ['name', 'nim']
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const count = await this.mhsModel.countDocuments(params)
    const query = await this.mhsModel.find(params, '-irs').populate('doswal', 'name _id').limit(limit).skip(skip).sort(sort)

    const response = query.map(obj => flattenObject(obj))
    return new CoreResponseData(count, limit, response)
  }

  async findMhs(id: string) {
    const query = await this.mhsModel.findById(id, '-irs -khs -pkl -skripsi').populate('doswal', 'name _id')
    return flattenObject(query)
  }

  async findMhsIRS(q: Query, id: string) {
    const filter = {
      status: String,
      semester: Number,
      sks: Number,
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const { irs } = await this.mhsModel.findById(id, 'irs -_id')

    const param = { _id: { $in: irs.map(irsItem => irsItem.toString()) } }
    const count = await this.irsModel.countDocuments({ ...param, ...params })
    const response = await this.irsModel.find({ ...param, ...params }, '-khs').limit(limit).skip(skip).sort(sort)
    return new CoreResponseData(count, limit, response)
  }

  async findMhsKHS(q: Query, id: string) {
    const filter = {
      semester: Number,
      sks: Number,
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const { irs } = await this.mhsModel.findById(id)

    const param = { _id: { $in: irs.map(irsItem => irsItem.toString()) } }
    console.log({ ...param, ...params })
    const count = await this.irsModel.countDocuments({ ...param, ...params })
    const query = await this.irsModel.find({ ...param, ...params }, '-fileURL -status -sks').limit(limit).skip(skip).sort(sort)

    const response = query.map(obj => flattenObject(obj))
    return new CoreResponseData(count, limit, response)
  }


  //FIXME: return data with defined format that have currsks
  async findMhsPKLById(id: string) {
    const { pkl } = await this.mhsModel.findById(id, 'pkl -_id')
    if (!pkl) return pkl
    else return await this.pklModel.findById(pkl, '_id passed nilai fileURL lulusAt')
  }

  //FIXME: return data with defined format that have currsks
  async findMhsSkripsiById(id: string) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) return skripsi
    else return await this.skripsiModel.findById(skripsi, '_id passed nilai fileURL lulusAt')
  }

  // =========================================
  // NOTE: VERIFY
  // =========================================

  async verifyIRSMhs(id: string, body: VerifyIRSDto) {
    const { status, semester } = body
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.findByIdAndUpdate(
      irs[semester - 1].toString(),
      {
        status,
      }, { new: true, runValidators: true }
    )

    return response
  }

  async verifyKHSMhs(id: string, body: VerifyKHSDto) {
    const { status, semester } = body
    const { irs } = await this.mhsModel.findById(id)

    const response = await this.irsModel.findByIdAndUpdate(
      irs[semester - 1].toString(),
      {
        $set: {
          'khs.status': status,
        }
      }, { new: true, runValidators: true }
    )

    return response
  }

  async verifyPKLMhs(id: string, body: VerifyPKLDto) {
    const { pkl } = await this.mhsModel.findById(id)
    if (!pkl) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the PKL`)

    const { isVerified } = body
    const response = await this.pklModel.findByIdAndUpdate(
      pkl.toString(),
      { isVerified },
      { new: true, runValidators: true }
    )

    return response
  }

  async verifySkripsiMhs(id: string, body: VerifySkripsiDto) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the Skripsi`)

    const { isVerified } = body
    const response = await this.skripsiModel.findByIdAndUpdate(
      skripsi.toString(),
      { isVerified },
      { new: true, runValidators: true }
    )

    return response
  }
  // =========================================
  // NOTE: DELETE
  // =========================================
  async deleteMhs(id: string) {
    await this.userService.deleteByUser(id)
    await this.userService.delete_sec(id)

    const mhs = await this.mhsModel.findByIdAndDelete(id)
    const { irs, pkl, skripsi } = mhs

    await this.irsModel.deleteMany({ _id: { $in: irs.map(irsItem => irsItem.toString()) } })
    if (pkl) await this.pklModel.findByIdAndDelete(pkl)
    if (skripsi) await this.skripsiModel.findByIdAndDelete(skripsi)

    return mhs
  }

  private async currSKS(id: string) {
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.aggregate([{
      $match: {
        _id: { $in: irs.map(irsItem => irsItem) },
        status: StatAP.VERIFIED
      }
    }, {
      $group: {
        _id: null,
        totalSKS: { $sum: "$sks" },
        count: { $sum: 1 }
      }
    }])

    return response[0]?.totalSKS || 0
  }

  // =========================================
  // NOTE: ADDITIONAL FUNCTION
  // =========================================

  private async parseCsvToJSON(file: Express.Multer.File): Promise<any[]> {
    const stream = toStream(file.buffer)

    const jsonRows = [];
    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          jsonRows.push(row);
        })
        .on('end', () => {
          resolve(jsonRows);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async statTotal(dosWal_id?: string) {
    let coreQuery: PipelineStage[] = []
    if (dosWal_id) { coreQuery.unshift({ $match: { dosWal: new Types.ObjectId(dosWal_id) } }) }

    const response = await this.mhsModel.aggregate(coreQuery).sortByCount('status')
    return response
  }

  private async statMhsBasedOnAR(dosWal_id?: string) {
    let coreQuery: PipelineStage[] = []
    if (dosWal_id) { coreQuery.unshift({ $match: { dosWal: new Types.ObjectId(dosWal_id) } }) }

    return await this.mhsModel.aggregate(coreQuery).sortByCount('AR')
  }

  private async statSkripsiBasedOnYoE(dosWal_id?: string) {
    let coreQuery: PipelineStage[] = [{
      $group: {
        _id: {
          YoE: '$YoE',
          status: { $cond: [{ $eq: ["$skripsi", null] }, "Taken", "Untaken"] },
        },
        count: { $count: {} }
      }
    }]

    if (dosWal_id) { coreQuery.unshift({ $match: { dosWal: new Types.ObjectId(dosWal_id) } }) }

    const response = await this.mhsModel.aggregate(coreQuery)
    return response.map(x => flattenObject(x))
  }

  private async statPKLBasedOnYoE(dosWal_id?: string) {
    let coreQuery: PipelineStage[] = [{
      $group: {
        _id: {
          YoE: '$YoE',
          status: { $cond: [{ $eq: ["$pkl", null] }, "Taken", "Untaken"] },
        },
        count: { $count: {} }
      }
    }]

    if (dosWal_id) { coreQuery.unshift({ $match: { dosWal: new Types.ObjectId(dosWal_id) } }) }

    const query = await this.mhsModel.aggregate(coreQuery)
    const response = query.map(x => flattenObject(x))
    return response
  }

  private async currSem(id: string) {
    const { irs } = await this.mhsModel.findById(id)

    const param = { _id: { $in: irs.map(irsItem => irsItem.toString()) }, status: StatAP.VERIFIED }
    const count = await this.irsModel.countDocuments({ ...param })

    return count || 0
  }

  async dashboard(user: UserEntity): Promise<any> {
    const { sub, roles } = user;

    // const statMhs = (roles === ROLE.DSN) ? await this.statTotal(sub) : await this.statTotal()
    // const statPKL = (roles === ROLE.DSN) ? await this.statPKLBasedOnYoE(sub) : await this.statPKLBasedOnYoE()
    // const statSkripsi = (roles === ROLE.DSN) ? await this.statSkripsiBasedOnYoE(sub) : await this.statSkripsiBasedOnYoE()
    // const statMhsAR = (roles === ROLE.DSN) ? await this.statMhsBasedOnAR(sub) : await this.statMhsBasedOnAR()

    const statMhs = await this.statTotal()
    const statPKL = await this.statPKLBasedOnYoE()
    const statSkripsi = await this.statSkripsiBasedOnYoE()
    const statMhsAR = await this.statMhsBasedOnAR()

    if (roles === ROLE.MHS) {
      const currSKS = await this.currSKS(sub.toString()) //Current total SKS verified
      const cummIPK = await this.cummIPK(sub.toString()) // cumulative IPK that verified
      const user = await this.isExist(sub.toString())
      const currSem = await this.currSem(sub.toString()) //active semester

      return { user, currSem, currSKS, cummIPK }
    } else if (roles === ROLE.DSN) {
      const user = await this.dsnService.isExist(sub.toString())
      return { user, statMhs, statMhsAR, statPKL, statSkripsi }
    } else {
      return { statMhs, statMhsAR, statPKL, statSkripsi }
    }
  }

  private async cummIPK(id: string) {
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.aggregate([
      { $match: { 
        _id: { $in: irs.map(irsItem => irsItem) }, 
        'khs.status': StatAP.VERIFIED 
      }}, 
      { $group: {
        _id: null,
        avgIPK: { $avg: "$khs.ipk" },
        count: { $sum: 1 }
      }}
    ])
    return response[0]?.avgIPK || 0
  }
}