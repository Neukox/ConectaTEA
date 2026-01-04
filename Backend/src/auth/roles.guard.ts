import { Injectable, CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserType } from "@prisma/client";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    this.logger.debug(`RolesGuard: Required roles: ${requiredRoles}`);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    this.logger.debug(`RolesGuard: User: ${JSON.stringify(user)}`);

    if (!user) {
      return false;
    }

    this.logger.debug(`RolesGuard: User role: ${user.tipo}`);

    return requiredRoles.some((role) => user.tipo === role);
  }
}
