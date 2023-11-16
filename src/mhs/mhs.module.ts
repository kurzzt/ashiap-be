import { Module } from '@nestjs/common';
import { MhsService } from './mhs.service';
import { MhsController } from './mhs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MHSSchema } from './schemas/mhs.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserModule } from './../user/user.module';
import { IRSSchema } from './schemas/irs.schema';
import { PKLSchema, SkripsiSchema } from './schemas/pkl-skripsi.schema';
import { DsnModule } from 'src/dsn/dsn.module';

@Module({
  imports: [
  MongooseModule.forFeature([
      {
        name: 'MHS',
        schema: MHSSchema
      },{
        name: 'IRS',
        schema: IRSSchema
      },{
        name: 'PKL',
        schema: PKLSchema
      },{
        name: 'Skripsi',
        schema: SkripsiSchema
      }
    ]),
    UserModule,
    CloudinaryModule,
    DsnModule
  ],
  controllers: [MhsController],
  providers: [MhsService],
  exports: [MhsService]
})
export class MhsModule {}
