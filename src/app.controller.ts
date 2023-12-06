import { Body, Controller, Get, HttpStatus, ParseFilePipeBuilder, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { TransformInterceptor } from 'utils/response.interceptor';
import { LoginDto } from './auth/login.dto';
import { Public } from 'src/auth/public.decorator';
import { ResponseMessage } from 'utils/response_message.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { MhsService } from './mhs/mhs.service';
import { User } from 'utils/user.decorator';
import { UserEntity } from 'utils/globals';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller()
@UseInterceptors(TransformInterceptor)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mhsService: MhsService
  ) { }

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @ResponseMessage('Logged In')
  @Post('login')
  async login(
    @Body() body: LoginDto
  ) {
    return this.appService.signIn(body)
  }

  @Post('file')
  @ResponseMessage('File Uploaded')
  @UseInterceptors(FileInterceptor('file'))
  async globalUploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: new RegExp(/(jpg|jpeg|png)$/),
        })
        .addMaxSizeValidator({
          maxSize: 50000000 //bit
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        }),
    ) file: Express.Multer.File
  ) {
    return this.appService.uploadSingleFile(file)
  }

  @Get('dashboard')
  @ResponseMessage('Dashboard')
  async dashboard(
    @User() user: UserEntity
  ){
    return this.appService.dashboard(user)
  }

  @Get('rekap-pkl')
  @ResponseMessage('Rekap PKL')
  async rekapPKL(
    @Query() q: ExpressQuery
  ){
    return this.appService.stat_rekap_pkl(q)
  }

  @Get('rekap-skripsi')
  @ResponseMessage('Rekap Skripsi')
  async rekapSkripsi(
    @Query() q: ExpressQuery
  ){
    return this.appService.stat_rekap_skripsi(q)
  }

  @Get('rekap-status')
  @ResponseMessage('Rekap Status')
  async rekapStatus(
    @Query() q: ExpressQuery
  ){
    return this.appService.stat_rekap_status(q)
  }
}
