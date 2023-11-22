import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DsnService } from './dsn.service';
import { DsnController } from './dsn.controller';
import { DSNSchema } from './schemas/dsn.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'DSN',
        schema: DSNSchema
      }
    ]),
    UserModule
  ],
  providers: [DsnService],
  controllers: [DsnController],
  exports: [DsnService]
})
export class DsnModule {}
