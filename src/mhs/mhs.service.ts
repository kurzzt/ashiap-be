import { faker } from '@faker-js/faker';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as csv from 'csv-parser';
import { Query } from 'express-serve-static-core';
import { Model } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { CoreResponseData } from 'utils/CoreResponseData';
import { defpass, flattenObject } from 'utils/common';
import { genParam } from 'utils/filter';
import { StatAP, StatMhs } from 'utils/global.enum';
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
    const haveRights = await this.currSKS(id)
    if (haveRights < 100) throw new BadRequestException(`You can't' take the PKL. Your SKS are below 100, namely ${haveRights}`)

    const { _id } = await this.pklModel.create({})
    const reponse = await this.mhsModel.findByIdAndUpdate(id, { pkl: _id }, { new: true, runValidators: true })
    return reponse
  }

  async createSkripsiMhs(id: string) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (skripsi) throw new BadRequestException(`User with ${id} IDs already take Skripsi`)
    const haveRights = await this.currSKS(id)
    if (haveRights < 120) throw new BadRequestException(`You can't' take the Skripsi. Your SKS are below 120, namely ${haveRights}`)

    const { _id } = await this.skripsiModel.create({})
    const reponse = await this.mhsModel.findByIdAndUpdate(id, { skripsi: _id }, { new: true, runValidators: true })
    return reponse
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

    // const randomPass = faker.internet.password({ length: 12 })
    const randomPass = defpass
    const hashPass = await bcrypt.hash(randomPass, 10)
    await this.userService.createUser_sec(createMhs._id, "", nim, randomPass)
    await this.userService.createUser_mhs(createMhs._id, nim, hashPass)

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
    const { email, AR, gender, address, province, noTelp, photoURL, password } = body
    const response = await this.mhsModel.findByIdAndUpdate(
      id,
      {
        AR, gender, address, province, noTelp,
        photoURL: photoURL.preview,
        check: true
      }, { new: true, runValidators: true }
    )

    const hashPass = await bcrypt.hash(password, 10)
    await this.userService.updateUser_mhs((response._id).toString(), email, password, hashPass)
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
    const { fileURL, khsIpk, semester } = body
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.findByIdAndUpdate(
      irs[semester - 1].toString(),
      {
        $set: {
          'khs.status': StatAP.UNVERIFIED,
          'khs.ipk': khsIpk,
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
      const { passed, nilai, fileURL, lulusAt } = body
      response = await this.pklModel.findByIdAndUpdate(pkl.toString(), {
        passed, nilai, 
        lulusAt: new Date(lulusAt),
        fileURL: fileURL.preview,
        lamastudi: await this.currSem(id),
        verified: StatAP.UNVERIFIED
      }, { new: true, runValidators: true })
      return response
    } else {
      const { passed, nilai, fileURL } = body
      const response = await this.pklModel.findByIdAndUpdate(pkl.toString(), { 
        passed, nilai,
        fileURL: fileURL.preview,
        lamastudi: await this.currSem(id),
        verified: StatAP.UNVERIFIED
      }, { new: true, runValidators: true })
      return response
    }
  }

  async updateSkripsi(id: string, body: UpdateSkripsiDto) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the Skripsi`)

    const { passed } = body
    if (passed) {
      const { passed, nilai, lulusAt, fileURL } = body
      const response = await this.skripsiModel.findByIdAndUpdate(skripsi.toString(), {
        passed, nilai, 
        lulusAt: new Date(lulusAt),
        fileURL: fileURL.preview,
        lamastudi: await this.currSem(id),
        verified: StatAP.UNVERIFIED
      }, { new: true, runValidators: true })
      return response
    } else {
      const { passed, nilai, fileURL } = body
      return await this.skripsiModel.findByIdAndUpdate(skripsi.toString(), { 
        passed, nilai,
        fileURL: fileURL.preview,
        lamastudi: await this.currSem(id),
        verified: StatAP.UNVERIFIED
      }, { new: true, runValidators: true })
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
    const query = await this.irsModel.find({ ...param, ...params }, '-fileURL -status').limit(limit).skip(skip).sort(sort).lean()

    let sksk = 0, ipk = 0
    const addfield = query.map((x, i) => {
      console.log(i)
      sksk += x.sks || 0
      ipk += x.khs.ipk || 0
      return {
        ...x, sksk, ipk: parseFloat((ipk/(i+1)).toFixed(2)) // Assigning cumulative sks to each document
      };
    })
    const response = addfield.map(obj => flattenObject(obj))
    return new CoreResponseData(count, limit, response)
  }

  async findMhsPKLById(id: string) {
    const sks = await this.currSKS(id)
    const { pkl } = await this.mhsModel.findById(id)
    let data = null
    if(pkl) data = await this.pklModel.findById(pkl)

    return { data, sks }
  }

  async findMhsSkripsiById(id: string) {
    const sks = await this.currSKS(id)
    const { skripsi } = await this.mhsModel.findById(id)
    let data = null
    if(skripsi) data = await this.skripsiModel.findById(skripsi)
    
    return { data, sks }
  }
  
  async findMhsOverviewById(id:string){
    const { irs, pkl, skripsi } = await this.mhsModel.findById(id)

    const param = { _id: { $in: irs.map(irsItem => irsItem.toString()) } }
    const irsmhs = await this.irsModel.find(param)
    const pklmhs = await this.pklModel.findById(pkl)
    const skripsimhs = await this.skripsiModel.findById(skripsi)

    let response = []
    for (let i = 1; i < 15; i++) {
      const virs = (irsmhs[i-1].status == 'Verified') ? true : false
      const vkhs = (irsmhs[i-1].khs.status == 'Verified') ? true : false
      const vpkl = (pklmhs?.lamastudi == i && pklmhs?.verified == 'Verified') ? true : false 
      const vskripsi = (skripsimhs?.lamastudi == i && skripsimhs?.verified == 'Verified') ? true : false 
      const data = {
        semester: i,
        irs: virs,
        khs: vkhs,
        pkl: vpkl,
        skripsi: vskripsi
      }
      response.push(data)
    }

    return response
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

    const { verified } = body
    const response = await this.pklModel.findByIdAndUpdate(
      pkl.toString(),
      { verified },
      { new: true, runValidators: true }
    )

    return response
  }

  async verifySkripsiMhs(id: string, body: VerifySkripsiDto) {
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the Skripsi`)

    const { verified } = body
    const response = await this.skripsiModel.findByIdAndUpdate(
      skripsi.toString(),
      { verified },
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

  // =========================================
  // NOTE: ADDITIONAL FUNCTION
  // =========================================

  async currSKS(id: string) {
    const { irs } = await this.mhsModel.findById(id)
    const response = await this.irsModel.aggregate([
      { $match: {
        _id: { $in: irs.map(irsItem => irsItem) },
        'khs.status': StatAP.VERIFIED
      }}, 
      { $group: {
        _id: null,
        totalSKS: { $sum: "$sks" },
        count: { $sum: 1 }
      }}
    ])
    return response[0]?.totalSKS || 0
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

  async stat_status() {
    return await this.mhsModel.aggregate([
      { $group: {
        _id: '$status',
        count: { $count : {} }
      }},
      { $project: {
        _id: 0,
        status: '$_id',
        count: '$count'
      }}
    ])
  }

  async stat_AR() {
    return await this.mhsModel.aggregate([
      { $group: {
        _id: '$AR',
        count: { $count : {} }
      }},
      { $project: {
        _id: 0,
        jalur: '$_id',
        count: '$count'
      }}
    ])
  }

  async statSkripsiBasedOnYoE(dosWal_id?: string) {
    return await this.mhsModel.aggregate([
      { $group: {
          _id: {
            YoE: '$YoE',
            status: { $cond: [{ $eq: ["$skripsi", null] }, "Taken", "Untaken"] } },
          count: { $count: {} } 
      }}, 
      { $project: {
        _id: 0,
        angkatan: '$_id.YoE',
        status: '$_id.status',
        count: '$count'
      }}
    ])
  }

  async statPKLBasedOnYoE() {
    return await this.mhsModel.aggregate([
      { $group: {
          _id: {
            YoE: '$YoE',
            status: { $cond: [{ $eq: ["$pkl", null] }, "Taken", "Untaken"] } },
          count: { $count: {} } 
      }}, 
      { $project: {
        _id: 0,
        angkatan: '$_id.YoE',
        status: '$_id.status',
        count: '$count'
      }}
    ])
  }

  async stat_rekap_status(q: Query) {
    const res = await this.mhsModel.aggregate([
      { $group: {
          _id: {
            YoE: '$YoE',
            status: '$status' },
          count: { $count: {} } 
      }}, 
      { $project: {
        _id: 0,
        angkatan: '$_id.YoE',
        status: '$_id.status',
        count: '$count'
      }}
    ])

    const start_date= Number(q.start_date) || new Date().getFullYear() - 7
    const end_date= Number(q.end_date) || new Date().getFullYear()
    let response = {}
    const status = Object.values(StatMhs)

    for(let i = start_date; i<=end_date; i++){
      response[i] = {}
      status.forEach(stat => {
        const x = res.find(item => item.angkatan === i && item.status === stat)
        response[i][stat] = x?.count ?? 0;
      })
    }
    return response
  }

  async currSem(id: string) {
    const { irs } = await this.mhsModel.findById(id)

    const param = { _id: { $in: irs.map(irsItem => irsItem.toString()) }, status: StatAP.VERIFIED }
    const count = await this.irsModel.countDocuments({ ...param })

    return count || 0
  }

  async dashboard(user: UserEntity): Promise<any> {
    
  }

  async cummIPK(id: string) {
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

  async stat_rekap(q: Query, res: any){
    console.log(q)
    const start_date= Number(q.start_date) || new Date().getFullYear() - 7
    const end_date= Number(q.end_date) || new Date().getFullYear()
    let response = {}
    
    for(let i = start_date; i<=end_date; i++){
      const untakenData = res.find(item => item.angkatan === i && item.status === 'Untaken')
      const takenData = res.find(item => item.angkatan === i && item.status === 'Taken')
      response[i] = {
        'Taken': untakenData?.count ?? 0,
        'Untaken': takenData?.count ?? 0
      }
    }
    return response
  }
}