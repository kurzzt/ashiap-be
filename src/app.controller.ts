import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { TransformInterceptor } from 'utils/response.interceptor';
import { LoginDto } from './auth/login.dto';
import { Public } from 'src/auth/public.decorator';
import { RolesGuard } from './roles.guard';
import { ResponseMessage } from 'utils/response_message.decorator';

@Controller()
@UseInterceptors(TransformInterceptor)
export class AppController {
  constructor(
    private readonly appService: AppService,
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
}
