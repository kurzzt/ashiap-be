import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MhsModule } from './mhs/mhs.module';
import { AdmModule } from './adm/adm.module';
import { DeptModule } from './dept/dept.module';
import { DsnModule } from './dsn/dsn.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { IsEmailUniqueConstraint } from 'utils/uniqueMail.decorator';
import { IsNIMUniqueConstraint } from './mhs/uniqueNIM.decorator';
import { IsNIPUniqueConstraint } from './dsn/uniqueNIP.decorator';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local'],
      isGlobal: true,
    }),
    MongooseModule.forRoot( process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          }
        }
      }
    }),
    UserModule,
    MhsModule,
    AdmModule,
    DeptModule,
    DsnModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CloudinaryService, 
    IsEmailUniqueConstraint, 
    IsNIMUniqueConstraint,
    IsNIPUniqueConstraint,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
