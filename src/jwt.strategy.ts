import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private userService: UserService,
        private configService: ConfigService,
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        })
    }

    async validate(payload){
        const { sub } = payload;
        const user = await this.userService.findUser(sub)
        if (!user) throw new UnauthorizedException('Login first to access this endpoint')
        return user
    }
}