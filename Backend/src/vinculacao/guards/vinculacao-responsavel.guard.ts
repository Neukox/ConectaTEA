import {
  CanActivate,
  Logger,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { VinculacaoService } from "../vinculacao.service";
import { Request } from "express";

@Injectable()
export default class VinculacaoResponsavelGuard implements CanActivate {
  private readonly logger = new Logger(VinculacaoResponsavelGuard.name);

  constructor(private readonly vinculacaoService: VinculacaoService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log("Verificando acesso do responsável à vinculação.");

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user.id;
    let criancaId = Number(request.params.criancaId || request.params.id);

    if (!criancaId || isNaN(criancaId)) {
      const criancaVinculada =
        await this.vinculacaoService.listarVinculoResponsavelCrianca(userId);

      if (!criancaVinculada) {
        this.logger.warn(
          `Nenhuma criança vinculada encontrada para o responsável ID ${userId}.`,
        );
        return false;
      }

      criancaId = criancaVinculada.id;
    }

    this.logger.debug(`Verificando vinculacao para criancaId: ${criancaId}`);
    const vinculacao =
      await this.vinculacaoService.verificarVinculoCriancaResponsavel(
        criancaId,
        userId,
      );

    if (!vinculacao) {
      this.logger.warn(
        `Vinculação não encontrada para o responsável com a criança ID ${criancaId}.`,
      );
      return false;
    }

    this.logger.log(`Acesso concedido para o responsável com a criança.`);

    request.crianca = {
      id: criancaId,
      responsavel_id: userId,
      status_vinculo_responsavel: vinculacao.status_vinculo_responsavel,
    };

    return true;
  }
}
