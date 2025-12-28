import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { $Enums } from "@prisma/client";

@Injectable()
export class VinculacaoService {
  constructor(private readonly prismaService: PrismaService) {}

  async vincularResponsavelACrianca(
    consetimentoId: number,
    criancaId: number,
    codigo: string
  ) {
    // Lógica para vincular responsável à criança
  }

  async adicionarHistoricoVinculacao(data: {
    criancaId: number;
    profissionalId: number;
    evento: $Enums.StatusVinculacao;
    responsavelId?: number;
    detalhes?: string;
  }) {
    await this.prismaService.historicoVinculos.create({
      data: {
        crianca_id: data.criancaId,
        profissional_id: data.profissionalId,
        responsavel_id: data.responsavelId || null,
        tipo_evento: data.evento,
        descricao: data.detalhes || "",
        data_evento: new Date(),
      },
    });
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
}
