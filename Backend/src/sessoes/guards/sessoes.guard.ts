import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { SessoesService } from "../sessoes.service";
import { PrismaService } from "../../prisma/prisma.service";
import { VinculacaoService } from "../../vinculacao/vinculacao.service";
import { Sessoes, UserType } from "@prisma/client";
import { Request } from "express";

@Injectable()
export default class SessoesGuard implements CanActivate {
  private readonly logger = new Logger(SessoesGuard.name);

  constructor(
    private readonly sessoesService: SessoesService,
    private readonly prisma: PrismaService,
    private readonly vinculacaoService: VinculacaoService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log("Verificando acesso à sessão.");

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const sessaoId = Number(request.params.id);

    this.logger.debug(`Verificando sessaoId: ${sessaoId}`);
    const sessao = await this.sessoesService.findOne(sessaoId);

    if (!sessao) {
      this.logger.warn(`Sessão com ID ${sessaoId} não encontrada.`);
      return false;
    }

    return await this.getRoleSpecificValidation(sessao, user);
  }

  async getRoleSpecificValidation(
    sessao: Sessoes,
    usuario: Express.User
  ): Promise<boolean> {
    this.logger.log(`Iniciando validação específica para o usuário.`);

    let vinculoValid = false;

    if (usuario.tipo === UserType.PROFISSIONAL) {
      this.logger.debug("Validação para PROFISSIONAL");
      vinculoValid = await this.validarProfissionalVinculo(usuario.id, sessao);
    }

    if (usuario.tipo === UserType.RESPONSAVEL) {
      this.logger.debug("Validação para RESPONSAVEL");
      vinculoValid = await this.validarResponsavelVinculo(usuario.id, sessao);
    }

    this.logger.log(`Vínculo válido: ${vinculoValid}`);
    return vinculoValid;
  }

  async validarProfissionalVinculo(
    userId: number,
    sessao: Sessoes
  ): Promise<boolean> {
    this.logger.log(
      `Validando vínculo do profissional para o usuário ID: ${userId}`
    );

    const profissional = await this.prisma.profissional.findFirst({
      where: {
        usuario_id: userId,
      },
    });

    this.logger.debug(
      `Profissional encontrado: ${profissional ? "Sim" : "Não"}`
    );

    if (!profissional) return false;

    const vinculo =
      await this.vinculacaoService.verificarVinculoCriancaProfissional(
        profissional.id,
        sessao.crianca_id
      );

    this.logger.debug(
      `Vínculo entre profissional e criança: ${vinculo ? "Sim" : "Não"}`
    );

    return !!vinculo;
  }

  async validarResponsavelVinculo(
    userId: number,
    sessao: Sessoes
  ): Promise<boolean> {
    this.logger.log(
      `Validando vínculo do responsável para o usuário ID: ${userId}`
    );

    const vinculo =
      await this.vinculacaoService.verificarVinculoCriancaResponsavel(
        sessao.crianca_id,
        userId
      );

    this.logger.debug(
      `Vínculo entre responsável e criança: ${vinculo ? "Sim" : "Não"}`
    );

    return !!vinculo;
  }
}
