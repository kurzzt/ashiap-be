import { Body, Controller, Delete, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateDsnDto } from './dto/create-dsn.dto';
import { DsnService } from './dsn.service';
import { DSN } from './schemas/dsn.schema';
import { ResponseMessage } from 'utils/response_message.decorator';
import { TransformInterceptor } from 'utils/response.interceptor';
import { RolesGuard } from 'src/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ROLE } from 'utils/global.enum';

@Controller('dsn')
@UseGuards(RolesGuard)
@Roles(ROLE.ADM)
@UseInterceptors(TransformInterceptor)
export class DsnController {
  constructor(private readonly dsnService: DsnService) { }

  @Post()
  @ResponseMessage('Successfully Add New Dosen')
  async createDsn(
    @Body() Dsn: CreateDsnDto
  ) {
    return this.dsnService.createDsn(Dsn)
  }

  @Get()
  @Roles(ROLE.DEPT)
  @ResponseMessage('Successfully Get All Dosen')
  async getAllDsn(): Promise<DSN[]> {
    return this.dsnService.findAllDsn()
  }

  @Get(':id')
  @Roles(ROLE.DEPT, ROLE.DSN)
  @ResponseMessage('Successfully Get Data Dosen')
  async getMhsById(
    @Param('id') id: string
  ): Promise<DSN> {
    return this.dsnService.findDsnById(id)
  }

  @Delete(':id')
  @ResponseMessage('Successfully Delete Data Dosen')
  async deleteDsnById(
    @Param('id') id: string
  ) {
    return this.dsnService.deleteDsnById(id)
  }
}
