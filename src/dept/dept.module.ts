import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeptService } from './dept.service';
import { DeptSchema } from './schemas/dept.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'DEPT',
        schema: DeptSchema
      }
    ])
  ],
  providers: [DeptService],
  exports: [DeptService]
})
export class DeptModule {}
