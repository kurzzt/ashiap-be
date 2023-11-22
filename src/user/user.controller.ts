import { Body, Controller, Get, Param, Post, Delete, UseInterceptors, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { TransformInterceptor } from 'utils/response.interceptor';
import { RolesGuard } from 'src/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ROLE } from 'utils/global.enum';
import { ResponseMessage } from 'utils/response_message.decorator';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller('user')
@UseGuards(RolesGuard)
@Roles(ROLE.ADM)
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ResponseMessage('Successfully Add New User')
  async create(
    @Body() body: CreateUserDto
  ) {
    return this.userService.createUser(body)
  }

  @Get()
  @ResponseMessage('Successfully Get All User')
  async list(
    @Query() q: ExpressQuery
  ) {
    return this.userService.listUser(q)
  }

  @Get(':id')
  @ResponseMessage('Successfully Get Data User')
  async find(
    @Param('id') id: string
  ) {
    return this.userService.findUser(id)
  }

  @Delete(':id')
  @ResponseMessage('Successfully Delete Data User')
  async delete(
    @Param('id') id: string
  ){
    return this.userService.deleteUser(id)
  }
}
