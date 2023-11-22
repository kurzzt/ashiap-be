import { Body, Controller, Get, HttpStatus, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { TransformInterceptor } from 'utils/response.interceptor';
import { LoginDto } from './auth/login.dto';
import { Public } from 'src/auth/public.decorator';
import { ResponseMessage } from 'utils/response_message.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { MhsService } from './mhs/mhs.service';
import { User } from 'utils/user.decorator';
import { UserEntity } from 'utils/globals';

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

  //FIXME: LOGIN USING EMAIL AND NIM OR NIP
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
          maxSize: 10000000 //bytes
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        }),
    ) file: Express.Multer.File
  ) {
    return this.appService.uploadSingleFile(file)
  }

  // FIXME: DASHBOARD RETURN FIX VALUE WHEN TOTAL DOC 0 
  @Get('dashboard')
  @ResponseMessage('Dashboard')
  async dashboard(
    @User() user: UserEntity
  ){
    return this.mhsService.dashboard(user)
  }
}
