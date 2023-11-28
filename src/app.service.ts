import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './auth/login.dto';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { UserEntity } from 'utils/globals';
import { MhsService } from './mhs/mhs.service';
import { ROLE } from 'utils/global.enum';
import { DsnService } from './dsn/dsn.service';
import { Query } from 'express-serve-static-core';

@Injectable()
export class AppService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private cloudinary: CloudinaryService,
    private mhsService: MhsService,
    private dsnService: DsnService
   ){}

  async signIn(body: LoginDto): Promise<any>{
    const { identifier, password } = body
    
    const user: any = await this.userService.login(identifier)
    console.log(user)
    // console.log(body)
    if(!Object.keys(user || {}).length) throw new UnauthorizedException('Invalid email or password')
    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if(!isPasswordMatched) throw new UnauthorizedException('Invalid email or password')
    
    const payload = { sub: user['user_id'] }
    return {
      user: user,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  
  getHello(): string {
    return 'Hello World!';
  }

  async uploadSingleFile(file: Express.Multer.File): Promise<Record<string, string>>{
    const { secure_url } = await this.cloudinary.uploadImage(file)
    return { preview: secure_url }
  }

  async dashboard(user: UserEntity){
    const { sub, roles } = user;

    const statMhs = await this.mhsService.stat_status()
    const statPKL = await this.mhsService.statPKLBasedOnYoE()
    const statSkripsi = await this.mhsService.statSkripsiBasedOnYoE()
    const statMhsAR = await this.mhsService.stat_AR()

    if (roles === ROLE.MHS) {
      const currSKS = await this.mhsService.currSKS(sub.toString()) //Current total SKS verified
      const cummIPK = await this.mhsService.cummIPK(sub.toString()) // cumulative IPK that verified
      const user = await this.mhsService.isExist(sub.toString())
      const currSem = await this.mhsService.currSem(sub.toString()) //active semester

      return { user, currSem, currSKS, cummIPK }
    } else if (roles === ROLE.DSN) {
      const user = await this.dsnService.isExist(sub.toString())
      return { user, statMhs, statMhsAR, statPKL, statSkripsi }
    } else {
      return { statMhs, statMhsAR, statPKL, statSkripsi }
    }
  }

  async stat_rekap_skripsi(q: Query){
    return await this.mhsService.stat_rekap(q, await this.mhsService.statSkripsiBasedOnYoE())
  }

  async stat_rekap_pkl(q: Query){
    return await this.mhsService.stat_rekap(q, await this.mhsService.statPKLBasedOnYoE())
  }

  async stat_rekap_status(q: Query){
    return await this.mhsService.stat_rekap_status(q)
  }
}
