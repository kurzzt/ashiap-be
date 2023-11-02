import { Module } from '@nestjs/common';
import { AdmService } from './adm.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ADMSchema } from './schemas/adm.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'ADM',
        schema: ADMSchema
      }
    ])
  ],
  providers: [AdmService],
  exports: [AdmService]
})
export class AdmModule { }
