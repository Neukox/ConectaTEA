import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Request } from "express";

@Injectable()
export class ProfissionalExistsGuard implements CanActivate {
  private readonly logger = new Logger(ProfissionalExistsGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    this.logger.debug(`Verificando profissional para userId: ${userId}`);

    if (!userId) {
      this.logger.warn("Usuário não autenticado.");
      throw new NotFoundException("Usuário não autenticado.");
    }

    const profissional = await this.prisma.profissional.findUnique({
      where: { usuario_id: userId },
      select: { id: true, usuario_id: true, especialidade: true },
    });

    if (!profissional) {
      this.logger.warn(`Profissional não encontrado para userId: ${userId}`);
      throw new NotFoundException(
        "Profissional não encontrado para este usuário."
      );
    }

    this.logger.debug(`Profissional encontrado: ${JSON.stringify(profissional)}`);
    // Adicionar profissional ao request para uso posterior
    request.profissional = profissional;

    return true;
  }
}
