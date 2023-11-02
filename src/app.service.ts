import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './auth/login.dto';

@Injectable()
export class AppService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
   ){}

  async signIn(body: LoginDto): Promise<any>{
    const { email, password } = body
    const user = await this.userService.findByEmail(email)
    // console.log(user)
    if(!user) throw new UnauthorizedException('Invalid email or password')
    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if(!isPasswordMatched) throw new UnauthorizedException('Invalid email or password')
    
    const payload = { sub: user.userId }
    return {
      user: user,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  
  getHello(): string {
    return 'Hello World!';
  }

  
}
