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
import { ROLE, StatIRS } from 'utils/global.enum';
import { UserEntity } from 'utils/globals';
import { CreateMhsDto } from './dto/create-mhs.dto';
import { UpdateIRSDto, UpdateKHSDto } from './dto/update-irs-khs.dto';
import { UpdateMhsDto } from './dto/update-mhs.dto';
import { UpdatePKLDto, UpdateSkripsiDto } from './dto/update-pkl-skripsi.dto';
import { IRS } from './schemas/irs.schema';
import { MHS } from './schemas/mhs.schema';
import { PKL, Skripsi } from './schemas/pkl-skripsi.schema';
var mongoose = require('mongoose');
import toStream = require('buffer-to-stream');
import { VerifyIRSDto, VerifyKHSDto, VerifyPKLDto, VerifySkripsiDto } from './dto/verify-ap.dto';
import { DsnService } from 'src/dsn/dsn.service';


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

    const param = { _id: { $in: irs.map(irsItem => irsItem.toString()) }, status: StatIRS.VERIFIED }
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
      const user = await this.findMhsById(sub.toString())
      const currSem = await this.currSem(sub.toString()) //active semester

      return { user, currSem, currSKS, cummIPK }
    } else if(roles === ROLE.DSN){
      const user = await this.dsnService.findDsnById(sub.toString())
      return { user, statMhs, statMhsAR, statPKL, statSkripsi }
    } else {
      return { statMhs, statMhsAR, statPKL, statSkripsi }
    }
  }

  private async cummIPK(id: string) {
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.aggregate([{
      $match: { _id: { $in: irs.map(irsItem => irsItem) }, 'khs.status': StatIRS.VERIFIED }
    }, {
      $group: {
        _id: null,
        avgIPK: { $avg: "$khs.ipk" },
        count: { $sum: 1 }
      }
    }
    ])
    return response[0]?.avgIPK || 0
  }
  private async currSKS(id: string) {
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.aggregate([
      { $match: { _id: { $in: irs.map(irsItem => irsItem) }, status: StatIRS.VERIFIED } },
      {
        $group: {
          _id: null,
          totalSKS: { $sum: "$sks" },
          count: { $sum: 1 }
        }
      }
    ])
    return response[0]?.totalSKS || 0
  }

  private async createIRS(sem: number) {
    const createIRS = await this.irsModel.create({
      status: StatIRS.NOT_UPLOADED,
      semester: sem,
      sks: null,
      fileURL: "",
      khs: {
        ipk: null,
        fileURL: "",
        status: StatIRS.NOT_UPLOADED
      }
    })

    return createIRS
  }

  async createPKL(id: string) {
    const { pkl } = await this.mhsModel.findById(id)
    if (pkl) throw new BadRequestException(`User with ${id} IDs already take PKL`)
    const haveRights = await this.currSKS(id)
    if (haveRights < 100) throw new BadRequestException(`You can't' take the PKL. Your SKS are below 100, namely ${haveRights}`)

    const { _id } = await this.pklModel.create({})
    const response = await this.mhsModel.findByIdAndUpdate(id, { pkl: _id }, { new: true, runValidators: true })
    return response
  }

  async createSkripsi(id: string) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (skripsi) throw new BadRequestException(`User with ${id} IDs already take Skripsi`)
    const haveRights = await this.currSKS(id)
    if (haveRights < 120) throw new BadRequestException(`You can't' take the Skripsi. Your SKS are below 120, namely ${haveRights}`)

    const { _id } = await this.skripsiModel.create({})
    const response = await this.mhsModel.findByIdAndUpdate(id, { skripsi: _id }, { new: true, runValidators: true })
    return response
  }

  async createMhs(mhs: CreateMhsDto) {
    const { nim, email, YoE, AR, status, desc, dosWalName } = mhs

    const validateDosWal = await this.userService.validateSecDB(dosWalName.toString())
    if (!validateDosWal) throw new NotFoundException(`Cant find the DosWal with ${dosWalName} IDs`)

    let irsLot = []
    for (let i = 1; i < 15; i++) {
      const newIRS = await this.createIRS(i)
      irsLot.push(newIRS._id)
    }

    const createMhs = await this.mhsModel.create({
      nim, name, YoE, AR, status, desc,
      irs: irsLot,
      dosWal: validateDosWal._id
    })

    const randomPass = faker.internet.password({ length: 12 });
    const createSecDB = await this.userService.createSecDB(createMhs._id, email, randomPass)

    return createMhs
  }

  async updateMhs(id: string, body: UpdateMhsDto) {
    const { gender, address, province, noTelp, photoURL } = body
    const response = await this.mhsModel.findByIdAndUpdate(
      id,
      { gender, address, province, noTelp, photoURL: photoURL.preview, check: true },
      { new: true, runValidators: true }
    )
    return response
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

  async findAllMhs(q: Query) {
    const filter: Record<string, any> = {
      YoE: Number,
      AR: String,
      status: String,
      dosWal: Object,
      gender: String,
      search: ['name', 'nim']
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const count = await this.mhsModel.countDocuments(params)
    const query = await this.mhsModel.find(params, '-irs -__v').populate('dosWal', 'name _id').limit(limit).skip(skip).sort(sort)

    const response = query.map(obj => flattenObject(obj))
    return new CoreResponseData(count, limit, response)
  }

  async findMhsById(id: string) {
    const query = await this.mhsModel.findById(id, '-irs -khs -pkl -skripsi -__v').populate('dosWal', 'name _id')
    return flattenObject(query)
  }

  async findMhsIRSById(q: Query, id: string) {
    const filter = {
      status: String,
      semester: Number,
      sks: Number,
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const { irs } = await this.mhsModel.findById(id, 'irs -_id')

    const param = { _id: { $in: irs.map(irsItem => irsItem.toString()) } }
    const count = await this.irsModel.countDocuments({ ...param, ...params })
    const response = await this.irsModel.find({ ...param, ...params }, '-khs -__v').limit(limit).skip(skip).sort(sort)
    return new CoreResponseData(count, limit, response)
  }

  async findMhsKHSById(q: Query, id: string) {
    const filter = {
      semester: Number,
      sks: Number,
    }

    const { limit, skip, params, sort } = genParam(q, filter)
    const { irs } = await this.mhsModel.findById(id)

    const param = { _id: { $in: irs.map(irsItem => irsItem.toString()) } }
    console.log({ ...param, ...params })
    const count = await this.irsModel.countDocuments({ ...param, ...params })
    const query = await this.irsModel.find({ ...param, ...params }, '-fileURL -__v').limit(limit).skip(skip).sort(sort)
    const response = query.map(obj => flattenObject(obj))
    return new CoreResponseData(count, limit, response)
  }

  async findMhsPKLById(id: string) {
    const { pkl } = await this.mhsModel.findById(id, 'pkl -_id')
    if (!pkl) return pkl
    else return await this.pklModel.findById(pkl, '_id passed nilai fileURL lulusAt')
  }

  async findMhsSkripsiById(id: string) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) return skripsi
    else return await this.skripsiModel.findById(skripsi, '_id passed nilai fileURL lulusAt')
  }


  async moveManyMhsToOtherDsn(dsnId: string, newDsnId: string) {
    try {
      // const mhsToBeMoved = await this.mhsModel.find({
      //   dosWal: new Types.ObjectId(dsnId),
      //   status: { $in: [StatMhs.AKTIF, StatMhs.CUTI, StatMhs.MANGKIR] }
      // })

      const mhsToBeMoved = await this.mhsModel.find({
        dosWal: new Types.ObjectId(dsnId)
      })

      for (const mhs of mhsToBeMoved) {
        mhs.dosWal = new mongoose.Types.ObjectId(newDsnId)
        await mhs.save();
      }

    } catch (err) {
      throw new BadRequestException(`slebew ${err}`)
    }
  }

  async updateIRS(id: string, body: UpdateIRSDto) {
    const { fileURL, sks, semester } = body
    const { irs } = await this.mhsModel.findById(id, 'irs -_id')
    const response = await this.irsModel.findByIdAndUpdate(
      irs[semester - 1].toString(),
      {
        status: StatIRS.UNVERIFIED,
        sks: sks,
        fileURL: fileURL.preview
      }, { new: true, runValidators: true }
    )

    return response
  }

  async updateKHS(id: string, body: UpdateKHSDto) {
    const { fileURL, ipk, semester } = body
    const { irs } = await this.mhsModel.findById(id, 'irs -_id')
    const response = await this.irsModel.findByIdAndUpdate(
      irs[semester - 1].toString(),
      {
        $set: {
          'khs.status': StatIRS.UNVERIFIED,
          'khs.ipk': ipk,
          'khs.fileURL': fileURL.preview
        }
      }, { new: true, runValidators: true }
    )

    return response
  }

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

  async updateSkripsi(id: string, body: UpdateSkripsiDto) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the Skripsi`)

    const { passed } = body
    if (passed) {
      const response = await this.skripsiModel.findByIdAndUpdate(skripsi.toString(), {
        passed: true,
        nilai: body.nilai,
        fileURL: body.fileURL.preview,
        lulusAt: new Date(),
        isVerified: false,
      }, { new: true, runValidators: true })
      return response
    } else {
      return await this.skripsiModel.findByIdAndUpdate(skripsi.toString(), { passed: false }, { new: true, runValidators: true })
    }
  }

  async verifyIRS(id: string, body: VerifyIRSDto) {
    const { status, semester } = body
    const { irs } = await this.mhsModel.findById(id, 'irs -_id')
    const response = await this.irsModel.findByIdAndUpdate(
      irs[semester - 1].toString(),
      {
        status,
      }, { new: true, runValidators: true }
    )

    return response
  }

  async verifyKHS(id: string, body: VerifyKHSDto) {
    const { status, semester } = body
    const { irs } = await this.mhsModel.findById(id, 'irs -_id')

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

  async verifyPKL(id: string, body: VerifyPKLDto) {
    const { pkl } = await this.mhsModel.findById(id)
    if (!pkl) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the PKL`)

    const { passed } = body
    const response = await this.pklModel.findByIdAndUpdate(
      pkl.toString(), {
      passed,
      fileURL: "",
      isVerified: true
    }, { new: true, runValidators: true }
    )

    return response
  }

  async verifySkripsi(id: string, body: VerifySkripsiDto) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the Skripsi`)

    const { passed } = body
    const response = await this.skripsiModel.findByIdAndUpdate(
      skripsi.toString(), {
      passed,
      fileURL: "",
      isVerified: true
    }, { new: true, runValidators: true }
    )

    return response
  }

  async deleteMhsById(id: string) {
    await this.userService.deleteUserByUserId(id)
    await this.userService.deleteSecDBById(id)

    const mhs = await this.mhsModel.findByIdAndDelete(id)
    const { irs, pkl, skripsi } = mhs

    await this.irsModel.deleteMany({ _id: { $in: irs.map(irsItem => irsItem.toString()) } })
    if (pkl) await this.pklModel.findByIdAndDelete(pkl)
    if (skripsi) await this.skripsiModel.findByIdAndDelete(skripsi)

    return mhs
  }

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
}