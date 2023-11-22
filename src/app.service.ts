import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './auth/login.dto';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Injectable()
export class AppService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private cloudinary: CloudinaryService
   ){}

  async signIn(body: LoginDto): Promise<any>{
    const { identifier, password } = body
    
    // FIXME: using different 
    const user = await this.userService.login(identifier)
    // console.log(user)
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
}
