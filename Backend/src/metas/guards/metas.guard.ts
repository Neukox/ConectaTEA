import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserType } from "@prisma/client";
import { ROLES_KEY } from "../../auth/roles.decorator";
import { VinculacaoService } from "../../vinculacao/vinculacao.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MetasGuard implements CanActivate {
  private readonly logger = new Logger(MetasGuard.name);
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly vinculacaoService: VinculacaoService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log("MetasGuard: Iniciando verificação de vínculo da meta.");

    const request = context.switchToHttp().getRequest();
    const metaId = request.params.id;
    this.logger.debug(`MetasGuard: Verificando metaId: ${metaId}`);

    const usuarioId = request.user?.id;
    this.logger.debug(`MetasGuard: Verificando usuárioId: ${usuarioId}`);

    const role = this.reflector.get<UserType>(ROLES_KEY, context.getHandler());
    this.logger.debug(`MetasGuard: Verificando role: ${role}`);

    if (!usuarioId) {
      return false;
    }

    const meta = await this.prisma.meta.findUnique({
      where: { id: Number(metaId) },
    });

    this.logger.debug(`MetasGuard: Meta encontrada: ${meta ? "Sim" : "Não"}`);

    if (!meta) {
      return false;
    }

    if (role === UserType.PROFISSIONAL) {
      const profissional = await this.prisma.profissional.findUnique({
        where: { usuario_id: usuarioId },
      });

      if (!profissional) {
        this.logger.warn(
          "MetasGuard: Profissional não encontrado para o usuário."
        );
        return false;
      }

      const isVinculado =
        await this.vinculacaoService.verificarVinculoCriancaProfissional(
          meta.crianca_id,
          profissional.id
        );

      if (!isVinculado) {
        this.logger.warn("MetasGuard: profissional não vinculado à criança.");
        return false;
      }
    }

    if (role === UserType.RESPONSAVEL) {
      const isVinculado =
        await this.vinculacaoService.verificarVinculoCriancaResponsavel(
          meta.crianca_id,
          usuarioId
        );

      if (!isVinculado) {
        this.logger.warn("MetasGuard: Responsável não vinculado à criança.");
        return false;
      }
    }

    this.logger.log(
      "MetasGuard: Verificação de vínculo concluída com sucesso."
    );

    return true;
  }
}
