import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/roles.guard';
import { ROLE } from 'utils/global.enum';
import { TransformInterceptor } from 'utils/response.interceptor';
import { ResponseMessage } from 'utils/response_message.decorator';
import { CreateMhsDto } from './dto/create-mhs.dto';
import { UpdateIRSDto, UpdateKHSDto } from './dto/update-irs-khs.dto';
import { UpdateMhsDto } from './dto/update-mhs.dto';
import { UpdatePKLDto, UpdateSkripsiDto } from './dto/update-pkl-skripsi.dto';
import { VerifyIRSDto, VerifyKHSDto, VerifyPKLDto, VerifySkripsiDto } from './dto/verify-ap.dto';
import { MhsService } from './mhs.service';
import { ValidateMhsParamId } from './validate-mhs-param.pipe';

@Controller('mhs')
@UseGuards(RolesGuard)
@Roles(ROLE.ADM)
@UseInterceptors(TransformInterceptor)
export class MhsController {
  constructor(private readonly mhsService: MhsService) { }

  @Post()
  @ResponseMessage('Successfully Add New Mahasiswa')
  async create(
    @Body() body: CreateMhsDto
  ) {
    return this.mhsService.createMhs(body)
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

  @Put(':id')
  @Roles(ROLE.MHS)
  @ResponseMessage('Successfully Update Data Mahasiswa')
  async update(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: UpdateMhsDto
  ) {
    return this.mhsService.updateMhs(id, body)
  }

  // FIXME: query
  @Get()
  @Roles(ROLE.DEPT, ROLE.DSN)
  @ResponseMessage('Successfully Get All Mahasiswa')
  async list(
    @Query() q: ExpressQuery
  ) {
    return this.mhsService.listMhs(q)
  }

  @Get(':id')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data Mahasiswa')
  async find(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhs(id)
  }

  @Get(':id/irs')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data IRS of Specific Mahasiswa IDs')
  async findIRS(
    @Query() q: ExpressQuery,
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsIRS(q, id)
  }

  @Get(':id/khs')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data KHS of Specific Mahasiswa IDs')
  async findKHS(
    @Query() q: ExpressQuery,
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsKHS(q, id)
  }

  //FIXME: return data with defined format that have currsks
  @Get(':id/pkl')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data PKL of Specific Mahasiswa IDs')
  async findPKL(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsPKLById(id)
  }

  //FIXME: return data with defined format that have currsks
  @Get(':id/skripsi')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data Skripsi of Specific Mahasiswa IDs')
  async findSkripsi(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsSkripsiById(id)
  }

  //FIXME: dont send throw new error, send data with defined format
  @Post(':id/pkl')
  @Roles(ROLE.MHS)
  @ResponseMessage('Successfully Take PKL')
  async createPKL(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.createPKLMhs(id)
  }

  //FIXME: dont send throw new error, send data with defined format
  @Post(':id/skripsi')
  @Roles(ROLE.MHS)
  @ResponseMessage('Successfully Take Skripsi')
  async createSkripsi(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.createSkripsiMhs(id)
  }

  @Put(':id/irs')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data IRS')
  async updateIRS(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: UpdateIRSDto
  ) {
    return this.mhsService.updateIRSMhs(id, body)
  }

  @Put(':id/khs')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data KHS')
  async updateKHS(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: UpdateKHSDto,
  ) {
    return this.mhsService.updateKHSMhs(id, body)
  }

  //FIXME: isverified flow
  @Put(':id/pkl')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data PKL')
  async updatePKL(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: UpdatePKLDto
  ) {
    return this.mhsService.updatePKL(id, body);
  }

  //FIXME: isverified flow
  @Put(':id/skripsi')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data Skripsi')
  async updateSkripsi(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: UpdateSkripsiDto
  ) {
    return this.mhsService.updateSkripsi(id, body)
  }

  @Put(':id/irs/verify')
  @Roles(ROLE.DSN)
  @ResponseMessage('Successfully Verify Data IRS')
  async verifyIRS(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: VerifyIRSDto,
  ) {
    return this.mhsService.verifyIRSMhs(id, body)
  }

  @Put(':id/khs/verify')
  @Roles(ROLE.DSN)
  @ResponseMessage('Successfully Verify Data KHS')
  async verifyKHS(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: VerifyKHSDto,
  ) {
    return this.mhsService.verifyKHSMhs(id, body)
  }

  @Put(':id/pkl/verify')
  @Roles(ROLE.DSN)
  @ResponseMessage('Successfully Verify Data PKL')
  async verifyPKL(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: VerifyPKLDto
  ) {
    return this.mhsService.verifyPKLMhs(id, body);
  }

  @Put(':id/skripsi/verify')
  @Roles(ROLE.DSN)
  @ResponseMessage('Successfully Verify Data Skripsi')
  async verifySkripsi(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: VerifySkripsiDto
  ) {
    return this.mhsService.verifySkripsiMhs(id, body)
  }

  @Delete(':id')
  @ResponseMessage('Successfully Delete Data Mahasiswa')
  async delete(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.deleteMhs(id)
  }
}
