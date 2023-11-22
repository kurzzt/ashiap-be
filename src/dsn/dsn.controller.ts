import { Body, Controller, Delete, Get, Param, Post, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { CreateDsnDto } from './dto/create-dsn.dto';
import { DsnService } from './dsn.service';
import { DSN } from './schemas/dsn.schema';
import { ResponseMessage } from 'utils/response_message.decorator';
import { TransformInterceptor } from 'utils/response.interceptor';
import { RolesGuard } from 'src/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ROLE } from 'utils/global.enum';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller('dsn')
@UseGuards(RolesGuard)
@Roles(ROLE.ADM)
@UseInterceptors(TransformInterceptor)
export class DsnController {
  constructor(private readonly dsnService: DsnService) { }

  @Post()
  @ResponseMessage('Successfully Add New Dosen')
  async create(
    @Body() body: CreateDsnDto
  ) {
    return this.dsnService.createDsn(body)
  }

  @Get()
  @Roles(ROLE.DEPT)
  @ResponseMessage('Successfully Get All Dosen')
  async list(
    @Query() q: ExpressQuery
  ) {
    return this.dsnService.listDsn(q)
  }

  @Get(':id')
  @Roles(ROLE.DEPT, ROLE.DSN)
  @ResponseMessage('Successfully Get Data Dosen')
  async find(
    @Param('id') id: string
  ): Promise<DSN> {
    return this.dsnService.findDsn(id)
  }

  @Delete(':id')
  @ResponseMessage('Successfully Delete Data Dosen')
  async delete(
    @Param('id') id: string
  ) {
    return this.dsnService.deleteDsn(id)
  }
}
