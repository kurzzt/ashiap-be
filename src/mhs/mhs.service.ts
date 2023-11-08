import { faker } from '@faker-js/faker';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as csv from 'csv-parser';
import { Query } from 'express-serve-static-core';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserService } from 'src/user/user.service';
import { flattenObject } from 'utils/common';
import { genParam } from 'utils/filter';
import { StatIRS } from 'utils/global.enum';
import { CreateMhsDto } from './dto/create-mhs.dto';
import { UpdateIRSDto } from './dto/update-irs.dto';
import { UpdateKHSDto } from './dto/update-khs.dto';
import { UpdateMhsDto } from './dto/update-mhs.dto';
import { UpdatePKLDto, UpdateSkripsiDto } from './dto/update-pkl-skripsi.dto';
import { IRS } from './schemas/irs.schema';
import { MHS } from './schemas/mhs.schema';
import { PKL, Skripsi } from './schemas/pkl.schema';
var mongoose = require('mongoose');
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
    private cloudinary: CloudinaryService
  ) { }

  async validateNIM(nim: string) { return await this.mhsModel.findOne({ nim }) }

  private async statTotal() {
    const response = await this.mhsModel.aggregate([{
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }])
    return response
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
    if (!response[0]) return 0
    return response[0].totalSKS
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
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)
    if (validUserId.pkl) throw new BadRequestException(`User with ${id} IDs already take PKL`)
    const haveRights = await this.currSKS(id)
    if (haveRights < 100) throw new BadRequestException(`You can't' take the PKL. Your SKS are below 100, namely ${haveRights}`)

    const { _id } = await this.pklModel.create({ nilai: null, fileURL: "", lulusAt: null })
    const response = await this.mhsModel.findByIdAndUpdate(id, { pkl: _id }, { new: true, runValidators: true })
    return response
  }

  async createSkripsi(id: string) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)
    if (validUserId.skripsi) throw new BadRequestException(`User with ${id} IDs already take Skripsi`)
    const haveRights = await this.currSKS(id)
    if (haveRights < 120) throw new BadRequestException(`You can't' take the Skripsi. Your SKS are below 120, namely ${haveRights}`)

    const { _id } = await this.skripsiModel.create({ nilai: null, fileURL: "", lulusAt: null })
    const response = await this.mhsModel.findByIdAndUpdate(id, { skripsi: _id }, { new: true, runValidators: true })
    return response
  }

  async createMhs(mhs: CreateMhsDto) {
    const { nim, name, email, YoE, AR, status, desc, dosWal } = mhs

    const validateDosWal = await this.userService.validateSecDB(dosWal.toString())
    if (!validateDosWal) throw new NotFoundException(`Cant find the DosWal with ${dosWal} IDs`)

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
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)

    const response = await this.mhsModel.findByIdAndUpdate(id, { ...body, check: true }, { new: true, runValidators: true })
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
      search: ['name', 'nim']
    }
    const { limit, skip, params } = genParam(q, filter)
    const count = await this.mhsModel.countDocuments()
    const query = await this.mhsModel.find(params, '_id nim name dosWal YoE AR status createdAt').populate('dosWal', 'name -_id').limit(limit).skip(skip)
    const response = query.map(obj => flattenObject(obj))
    return { total: count, totalPage: Math.ceil(count / limit), data: response }
  }

  async findMhsById(id: string) {
    const query = await this.mhsModel.findById(id, '-irs -khs -pkl -skripsi -__v').populate('dosWal', 'name -_id')
    if (query) return flattenObject(query)
    else throw new BadRequestException(`Cant find User with ${id} IDs`)
  }


  async findMhsIRSById(id: string) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)

    const { irs } = await this.mhsModel.findById(id, 'irs -_id')
    const response = await this.irsModel.find({ _id: { $in: irs.map(irsItem => irsItem.toString()) } }, '-khs -__v -createdAt -updatedAt')
    return response
  }

  async findMhsKHSById(id: string) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)

    const { irs } = await this.mhsModel.findById(id)
    const query = await this.irsModel.find({ _id: { $in: irs.map(irsItem => irsItem.toString()) } }, 'semester sks khs')
    const response = query.map(obj => flattenObject(obj))
    return response
  }

  async findMhsPKLById(id: string) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)

    const { pkl } = await this.mhsModel.findById(id, 'pkl -_id')
    if (!pkl) return pkl
    else return await this.pklModel.findById(pkl, '_id passed nilai fileURL lulusAt')
  }

  async findMhsSkripsiById(id: string) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)

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
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)

    const { fileURL, sks, sem } = body
    const { irs } = await this.mhsModel.findById(id, 'irs -_id')
    const response = await this.irsModel.findByIdAndUpdate(
      irs[sem - 1].toString(),
      {
        status: StatIRS.UNVERIFIED,
        sks: sks,
        fileURL: fileURL
      }, { new: true, runValidators: true }
    )

    return response
  }

  async updateKHS(id: string, body: UpdateKHSDto) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)

    const { fileURL, ipk, sem } = body
    const { irs } = await this.mhsModel.findById(id, 'irs -_id')
    const response = await this.irsModel.findByIdAndUpdate(
      irs[sem - 1].toString(),
      {
        $set: {
          'khs.status': StatIRS.UNVERIFIED,
          'khs.ipk': ipk,
          'khs.fileURL': fileURL
        }
      }, { new: true, runValidators: true }
    )

    return response
  }

  async updatePKL(id: string, body: UpdatePKLDto) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)
    const { pkl } = await this.mhsModel.findById(id)
    if (!pkl) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the PKL`)

    let response: Object
    if (body.passed) {
      response = await this.pklModel.findByIdAndUpdate(pkl.toString(), {
        passed: true,
        nilai: body.nilai,
        fileURL: body.fileURL,
        lulusAt: new Date()
      }, { new: true, runValidators: true })
      return response
    } else {
      const response = await this.pklModel.findByIdAndUpdate(pkl.toString(), { passed: false }, { new: true, runValidators: true })
      return response
    }
  }

  async updateSkripsi(id: string, body: UpdateSkripsiDto) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)
    const { skripsi } = await this.mhsModel.findById(id)
    if (!skripsi) throw new BadRequestException(`User with ${id} IDs hasn't yet taken the Skripsi`)

    let response: Object
    if (body.passed) {
      response = await this.pklModel.findByIdAndUpdate(skripsi.toString(), {
        passed: true,
        nilai: body.nilai,
        fileURL: body.fileURL,
        lulusAt: new Date()
      }, { new: true, runValidators: true })
      return response
    } else {
      return await this.pklModel.findByIdAndUpdate(skripsi.toString(), { passed: false }, { new: true, runValidators: true })
    }
  }

  async deleteMhsById(id: string) {
    const validUserId = await this.mhsModel.findById(id)
    if (!validUserId) throw new BadRequestException(`Cant find User with ${id} IDs`)

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