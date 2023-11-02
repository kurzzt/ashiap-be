import { Body, Controller, Post, Get, Param, Query, Delete, Put, UploadedFile, UseInterceptors, ParseFilePipeBuilder, HttpStatus, UseGuards } from '@nestjs/common';
import { MhsService } from './mhs.service';
import { CreateMhsDto } from './dto/create-mhs.dto';
import { UpdateIRSDto } from './dto/update-irs.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateKHSDto } from './dto/update-khs.dto';
import { ResponseMessage } from 'utils/response_message.decorator';
import { TransformInterceptor } from 'utils/response.interceptor';
import { UpdatePKLDto, UpdateSkripsiDto } from './dto/update-pkl-skripsi.dto';
import { RolesGuard } from 'src/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ROLE } from 'utils/global.enum';

@Controller('mhs')
@UseGuards(RolesGuard)
@Roles(ROLE.ADM)
@UseInterceptors(TransformInterceptor)
export class MhsController {
  constructor(private readonly mhsService: MhsService) { }

  @Post()
  @ResponseMessage('Successfully Add New Mahasiswa')
  async createMhs(
    @Body() Mhs: CreateMhsDto
  ) {
    return this.mhsService.createMhs(Mhs)
  }

  // @Post('csv')
  // @UseInterceptors(FileInterceptor('file'))
  // async bulkDataMhs(
  // @UploadedFile(
  //   new ParseFilePipeBuilder()
  //     .addFileTypeValidator({
  //       fileType: '.csv',
  //     })
  //     .addMaxSizeValidator({
  //       maxSize: 10000000
  //     })
  //     .build({
  //       errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
  //     }),
  // ) file: Express.Multer.File
  // ) {
  //   return this.mhsService.bulkDataMhs(file)
  // }

  @Get()
  @Roles(ROLE.DEPT, ROLE.DSN)
  @ResponseMessage('Successfully Get AllMahasiswa')
  async getAllMhs(
    @Query() q: ExpressQuery
  ) {
    return this.mhsService.findAllMhs(q)
  }

  @Get(':id')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data Mahasiswa')
  async getMhsById(
    @Param('id') id: string
  ) {
    return this.mhsService.findMhsById(id)
  }

  @Get(':id/irs')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data IRS of Specific Mahasiswa IDs')
  async getMhsIRS(
    @Param('id') id: string
  ) {
    return this.mhsService.findMhsIRSById(id)
  }


  @Get(':id/khs')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data KHS of Specific Mahasiswa IDs')
  async getMhsKHS(
    @Param('id') id: string
  ) {
    return this.mhsService.findMhsKHSById(id)
  }

  @Get(':id/pkl')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data PKL of Specific Mahasiswa IDs')
  async getMhsPKL(
    @Param('id') id: string
  ) {
    return this.mhsService.findMhsPKLById(id)
  }

  @Get(':id/skripsi')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data Skripsi of Specific Mahasiswa IDs')
  async getMhsSkripsi(
    @Param('id') id: string
  ) {
    return this.mhsService.findMhsSkripsiById(id)
  }

  @Post(':id/pkl')
  @Roles(ROLE.MHS)
  @ResponseMessage('Successfully Take PKL')
  async createPKL(
    @Param('id') id: string
  ) {
    return this.mhsService.createPKL(id)
  }

  @Post(':id/skripsi')
  @Roles(ROLE.MHS)
  @ResponseMessage('Successfully Take Skripsi')
  async createSkripsi(
    @Param('id') id: string
  ) {
    return this.mhsService.createSkripsi(id)
  }

  @Put(':id/irs')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data IRS')
  @UseInterceptors(FileInterceptor('file'))
  async updateIRSMhs(
    @Param('id') id: string,
    @Body() data: UpdateIRSDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'png',
        })
        .addMaxSizeValidator({
          maxSize: 10000000
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        }),
    ) file: Express.Multer.File
  ) {
    return this.mhsService.updateIRS(id, data, file)
  }

  @Put(':id/khs')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data KHS')
  @UseInterceptors(FileInterceptor('file'))
  async updateKHSMhs(
    @Param('id') id: string,
    @Body() data: UpdateKHSDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'png',
        })
        .addMaxSizeValidator({
          maxSize: 10000000
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        }),
    ) file: Express.Multer.File
  ) {
    return this.mhsService.updateKHS(id, data, file)
  }

  @Put(':id/pkl')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data PKL')
  @UseInterceptors(FileInterceptor('file'))
  async updatePKLMhs(
    @Param('id') id: string,
    @Body() data: UpdatePKLDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.png',
        })
        .addMaxSizeValidator({
          maxSize: 10000000
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false
        }),
    ) file: Express.Multer.File,
  ) {
    return this.mhsService.updatePKL(id, file, data);
  }

  @Put(':id/skripsi')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data Skripsi')
  @UseInterceptors(FileInterceptor('file'))
  async updateSkripsiMhs(
    @Param('id') id: string,
    @Body() data: UpdateSkripsiDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.png',
        })
        .addMaxSizeValidator({
          maxSize: 10000000
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false
        }),
    ) file: Express.Multer.File,
  ){
    return this.mhsService.updateSkripsi(id, file, data)
  }

  @Delete(':id')
  @ResponseMessage('Successfully Delete Data Mahasiswa')
  async deleteMhsById(
    @Param('id') id: string
  ) {
    return this.mhsService.deleteMhsById(id)
  }


  // @Get('/paramsTest3/:number/:name/:age')
  // getIdTest3(@Param() params:number): string{
  //   console.log(params);
  //   return this.appService.getMultipleParams(params);
  // }
  // { number:11, name: thiago, age: 23 }
}
