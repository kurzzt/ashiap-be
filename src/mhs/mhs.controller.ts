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
    @Param('id', ValidateMhsParamId) id: string,
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
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsById(id)
  }

  @Get(':id/irs')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data IRS of Specific Mahasiswa IDs')
  async getMhsIRS(
    @Query() q: ExpressQuery,
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsIRSById(q, id)
  }


  @Get(':id/khs')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data KHS of Specific Mahasiswa IDs')
  async getMhsKHS(
    @Query() q: ExpressQuery,
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsKHSById(q, id)
  }

  @Get(':id/pkl')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data PKL of Specific Mahasiswa IDs')
  async getMhsPKL(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsPKLById(id)
  }

  @Get(':id/skripsi')
  @Roles(ROLE.DEPT, ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Get Data Skripsi of Specific Mahasiswa IDs')
  async getMhsSkripsi(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.findMhsSkripsiById(id)
  }

  @Post(':id/pkl')
  @Roles(ROLE.MHS)
  @ResponseMessage('Successfully Take PKL')
  async createPKL(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.createPKL(id)
  }

  @Post(':id/skripsi')
  @Roles(ROLE.MHS)
  @ResponseMessage('Successfully Take Skripsi')
  async createSkripsi(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.createSkripsi(id)
  }

  @Put(':id/irs')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data IRS')
  async updateIRSMhs(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() data: UpdateIRSDto
  ) {
    return this.mhsService.updateIRS(id, data)
  }

  @Put(':id/khs')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data KHS')
  async updateKHSMhs(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() data: UpdateKHSDto,
  ) {
    return this.mhsService.updateKHS(id, data)
  }

  @Put(':id/pkl')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data PKL')
  async updatePKLMhs(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() data: UpdatePKLDto
  ) {
    return this.mhsService.updatePKL(id, data);
  }

  @Put(':id/skripsi')
  @Roles(ROLE.DSN, ROLE.MHS)
  @ResponseMessage('Successfully Update Data Skripsi')
  async updateSkripsiMhs(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() data: UpdateSkripsiDto
  ) {
    return this.mhsService.updateSkripsi(id, data)
  }

  @Put(':id/irs/verify')
  @Roles(ROLE.DSN)
  @ResponseMessage('Successfully Verify Data IRS')
  async verifyIRSMhs(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: VerifyIRSDto,
  ) {
    return this.mhsService.verifyIRS(id, body)
  }

  @Put(':id/khs/verify')
  @Roles(ROLE.DSN)
  @ResponseMessage('Successfully Verify Data KHS')
  async verifyKHSMhs(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: VerifyKHSDto,
  ) {
    return this.mhsService.verifyKHS(id, body)
  }

  @Put(':id/pkl/verify')
  @Roles(ROLE.DSN)
  @ResponseMessage('Successfully Verify Data PKL')
  async verifyPKLMhs(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: VerifyPKLDto
  ) {
    return this.mhsService.verifyPKL(id, body);
  }

  @Put(':id/skripsi/verify')
  @Roles(ROLE.DSN)
  @ResponseMessage('Successfully Verify Data Skripsi')
  async verifySkripsiMhs(
    @Param('id', ValidateMhsParamId) id: string,
    @Body() body: VerifySkripsiDto
  ) {
    return this.mhsService.verifySkripsi(id, body)
  }

  @Delete(':id')
  @ResponseMessage('Successfully Delete Data Mahasiswa')
  async deleteMhsById(
    @Param('id', ValidateMhsParamId) id: string,
  ) {
    return this.mhsService.deleteMhsById(id)
  }
}
