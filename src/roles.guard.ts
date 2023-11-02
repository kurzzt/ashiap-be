import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './auth/roles.decorator';
import { ROLE } from './../utils/global.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAll<ROLE[]>(ROLES_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);
    if (!requiredRoles) return true
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}