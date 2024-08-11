import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGaurd } from '@nestjs/passport';

@Injectable()
export class AuthGuard extends PassportAuthGaurd('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const controller = context.getClass();

    if (this.reflector.get<boolean>('isPrivate', handler))
      return super.canActivate(context);
    else if (this.reflector.get<boolean>('isPublic', handler)) return true;
    else if (this.reflector.get<boolean>('isPublic', controller)) return true;
    else return super.canActivate(context);
  }
}
