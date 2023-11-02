import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { secDBSchema } from './schemas/secDB.schema';
import { AdmModule } from 'src/adm/adm.module';
import { DeptModule } from 'src/dept/dept.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema
      },{
        name: 'secDB',
        schema: secDBSchema
      }
    ]),
    AdmModule,
    DeptModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
