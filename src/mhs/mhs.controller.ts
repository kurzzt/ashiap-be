import { Body, Controller, Post, Get, Param, Query, Delete, Put, UseInterceptors, UseGuards, Res } from '@nestjs/common';
import { MhsService } from './mhs.service';
import { CreateMhsDto } from './dto/create-mhs.dto';
import { UpdateIRSDto } from './dto/update-irs.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { UpdateKHSDto } from './dto/update-khs.dto';
import { ResponseMessage } from 'utils/response_message.decorator';
import { TransformInterceptor } from 'utils/response.interceptor';
import { UpdatePKLDto, UpdateSkripsiDto } from './dto/update-pkl-skripsi.dto';
import { RolesGuard } from 'src/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ROLE } from 'utils/global.enum';
import { UpdateMhsDto } from './dto/update-mhs.dto';
import { Response } from 'express';

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
  
  // GET CONTEXT
  @Put(':id')
  @Roles(ROLE.MHS)
  @ResponseMessage('Successfully Update Data Mahasiswa')
  async updateMhs(
    @Param('id') id: string,
    @Body() body: UpdateMhsDto
  ) {
    return this.mhsService.updateMhs(id, body)
  }
  
  @Get()
  @Roles(ROLE.DEPT, ROLE.DSN)
  @ResponseMessage('Successfully Get All Mahasiswa')
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
    @Query() q: ExpressQuery,
    @Param('id') id: string
  ) {
    return this.mhsService.findMhsIRSById(q, id)
  }


  @Get(':id/khs')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data KHS of Specific Mahasiswa IDs')
  async getMhsKHS(
    @Query() q: ExpressQuery,
    @Param('id') id: string
  ) {
    return this.mhsService.findMhsKHSById(q, id)
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

  // GET CONTEXT
  @Put(':id/irs')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data IRS')
  async updateIRSMhs(
    @Param('id') id: string,
    @Body() data: UpdateIRSDto,
    @Res() res: Response
  ) {
    return this.mhsService.updateIRS(id, data, res)
  }

  // GET CONTEXT
  @Put(':id/khs')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data KHS')
  async updateKHSMhs(
    @Param('id') id: string,
    @Body() data: UpdateKHSDto,
  ) {
    return this.mhsService.updateKHS(id, data)
  }

  // GET CONTEXT
  @Put(':id/pkl')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data PKL')
  async updatePKLMhs(
    @Param('id') id: string,
    @Body() data: UpdatePKLDto
  ) {
    return this.mhsService.updatePKL(id, data);
  }

  // GET CONTEXT
  @Put(':id/skripsi')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data Skripsi')
  async updateSkripsiMhs(
    @Param('id') id: string,
    @Body() data: UpdateSkripsiDto
  ){
    return this.mhsService.updateSkripsi(id, data)
  }

  @Delete(':id')
  @ResponseMessage('Successfully Delete Data Mahasiswa')
  async deleteMhsById(
    @Param('id') id: string
  ) {
    return this.mhsService.deleteMhsById(id)
  }
}
