import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { $Enums } from "@prisma/client";
import { TokenVinculoService } from "../token-vinculo/token-vinculo.service";
import { VincularResponsavelDto } from "./dto/vincularResponsavel.dto";

@Injectable()
export class VinculacaoService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenVinculoService: TokenVinculoService
  ) {}

  async validarCodigoVinculacao(codigo: string, responsavelId: number) {
    const codigoValido = await this.tokenVinculoService.validarCodigo(codigo);

    const result = await this.prismaService.$transaction(async (prisma) => {
      const codigoUsado = await prisma.tokenVinculo.update({
        where: { id: codigoValido.id },
        data: {
          status: "USADO",
          usado_por: responsavelId,
          data_uso: new Date(),
        },
      });

      await prisma.historicoVinculos.create({
        data: {
          crianca_id: codigoUsado.crianca_id,
          profissional_id: codigoUsado.profissional_id,
          tipo_evento: $Enums.StatusVinculacao.TOKEN_USADO,
          responsavel_id: codigoUsado.usado_por,
          descricao: `Vínculo realizado via código: ${codigo}`,
        },
      });

      return { message: "Código de vinculação validado com sucesso." };
    });

    return result;
  }

  async vincularResponsavelACrianca(
    vincularResponsavelDto: VincularResponsavelDto
  ) {
    const token = await this.tokenVinculoService.buscarTokenUsado(
      vincularResponsavelDto.criancaId,
      vincularResponsavelDto.profissionalId,
      vincularResponsavelDto.responsavelId
    );

    if (!token) {
      throw new NotFoundException(
        "Token de vinculação não encontrado ou não foi usado pelo responsável."
      );
    }

    if (!vincularResponsavelDto.consentimentoAceito) {
      throw new BadRequestException(
        "Consentimento para vinculação não foi aceito."
      );
    }

    const result = await this.prismaService.$transaction(async (prisma) => {
      const vinculacaoExistente = await prisma.profissionalCriança.findUnique({
        where: {
          profissional_id_crianca_id: {
            profissional_id: vincularResponsavelDto.profissionalId,
            crianca_id: vincularResponsavelDto.criancaId,
          },
        },
      });

      if (!vinculacaoExistente) {
        throw new NotFoundException(
          "Vínculo entre profissional e criança não encontrado."
        );
      }

      const consentimentoAceito = await prisma.consentimento.create({
        data: {
          crianca_id: vincularResponsavelDto.criancaId,
          responsavel_id: vincularResponsavelDto.responsavelId,
          profissional_id: vincularResponsavelDto.profissionalId,
          aceito: true,
        },
        select: { aceito: true, data_aceite: true },
      });

      const vinculacaoProfissional = await prisma.profissionalCriança.update({
        where: {
          profissional_id_crianca_id: {
            profissional_id: vincularResponsavelDto.profissionalId,
            crianca_id: vincularResponsavelDto.criancaId,
          },
        },
        data: {
          status_vinculo: "VINCULADO",
        },
      });

      await prisma.historicoVinculos.create({
        data: {
          crianca_id: vincularResponsavelDto.criancaId,
          profissional_id: vincularResponsavelDto.profissionalId,
          responsavel_id: vincularResponsavelDto.responsavelId,
          tipo_evento: $Enums.StatusVinculacao.VINCULO_CRIADO,
          descricao: `Responsável ID ${vincularResponsavelDto.responsavelId} vinculado à criança.`,
        },
      });

      return {
        message: "Vínculo realizado com sucesso.",
        responsavelId: vincularResponsavelDto.responsavelId,
        criancaId: vincularResponsavelDto.criancaId,
        profissionalId: vinculacaoProfissional.profissional_id,
        consentimento: {
          aceito: consentimentoAceito.aceito,
          data_aceite: consentimentoAceito.data_aceite,
        },
      };
    });

    return result;
  }

  async buscarHistoricoVinculacoes(criancaId: number) {
    const historico = await this.prismaService.historicoVinculos.findMany({
      where: { crianca_id: criancaId },
      orderBy: { data_evento: "desc" },
    });

    if (!historico) {
      throw new NotFoundException(
        "Histórico de vinculações não encontrado para a criança especificada."
      );
    }

    return historico;
  }

  async verificarVinculoCriancaProfissional(
    criancaId: number,
    profissionalId: number
  ) {
    const vinculo = await this.prismaService.profissionalCriança.findUnique({
      where: {
        profissional_id_crianca_id: {
          profissional_id: profissionalId,
          crianca_id: criancaId,
        },
        AND: { status_vinculo: "VINCULADO" },
      },
    });

    return vinculo;
  }

  async verificarVinculoCriancaResponsavel(
    criancaId: number,
    responsavelId: number
  ) {
    const vinculo = await this.prismaService.crianca.findUnique({
      where: {
        id: criancaId,
        responsavel_id: responsavelId,
        status_vinculo_responsavel: "VINCULADO",
      },
      include: { responsavel: true },
    });

    return vinculo;
  }
}
