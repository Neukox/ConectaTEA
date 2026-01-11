import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MetasService } from "../metas/metas.service";

@Injectable()
export class ProgressoService {
  private readonly logger = new Logger(ProgressoService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MetasService))
    private readonly metasService: MetasService
  ) {}

  async getProgressoRecentes(profissionalId: number) {
    this.logger.debug(
      `Buscando progressos recentes para profissional ID: ${profissionalId}`
    );

    const progressos = await this.prisma.progresso.findMany({
      where: { profissional_id: profissionalId },
      orderBy: { data: "desc" },
      take: 3,
      select: {
        id: true,
        data: true,
        descricao: true,
        progressoAnterior: true,
        progressoAtual: true,
        meta: {
          select: {
            id: true,
            titulo: true,
            crianca: { select: { nome: true } },
          },
        },
        profissional: {
          select: { usuario: { select: { name: true } }, titulo: true },
        },
      },
    });

    this.logger.log(
      `Encontrados progressos recentes para profissional ID: ${profissionalId}`
    );

    return progressos.map((progresso) => {
      const diferencaProgresso = this.calcularDiferencaProgresso(
        progresso.progressoAnterior,
        progresso.progressoAtual
      );

      return {
        id: progresso.id,
        data: progresso.data,
        descricao: progresso.descricao,
        diferenca: diferencaProgresso,
        progresso_atual: progresso.progressoAtual,
        meta: {
          id: progresso.meta.id,
          titulo: progresso.meta.titulo,
        },
        crianca: progresso.meta.crianca.nome,
        profissional: {
          titulo: progresso.profissional.titulo,
          nome: progresso.profissional.usuario.name,
        },
      };
    });
  }

  async getResumo(profissionalId: number) {
    this.logger.debug(`Obtendo resumo dos progressos`);
    const metas = await this.metasService.findAll({}, profissionalId);

    const metasPorStatus = this.metasService.countMetasByStatus(metas);

    this.logger.debug("metasPorStatus: " + JSON.stringify(metasPorStatus));

    const metasAtivas =
      metasPorStatus["EM_ANDAMENTO"] +
      metasPorStatus["QUASE_CONCLUIDA"] +
      metasPorStatus["VENCENDO"];

    const metasConcluidas = metasPorStatus["CONCLUIDA"];

    let progressoList = metas.map((meta) => meta.progresso || 0);

    const mediaProgresso = this.calcularMediaProgresso(progressoList);

    const criancasAtivas = await this.prisma.profissionalCriança.count({
      where: {
        profissional_id: profissionalId,
        status_vinculo: "VINCULADO",
      },
    });

    this.logger.log(`Resumo dos progressos obtido com sucesso`);

    return {
      media_progreeso: mediaProgresso,
      metas_ativas: metasAtivas,
      metas_concluidas: metasConcluidas,
      criancas_ativas: criancasAtivas,
    };
  }

  async obterUltimoProgresso(metaId: number) {
    return this.prisma.progresso.findFirst({
      where: { meta_id: metaId },
      orderBy: { data: "desc" },
    });
  }

  calcularDiferencaProgresso(
    progressoAnterior: number,
    progressoAtual: number
  ): number {
    return progressoAtual - progressoAnterior;
  }

  calcularMediaProgresso(progressoList: number[]): number {
    if (progressoList.length === 0) return 0;
    const soma = progressoList.reduce((acc, val) => acc + val, 0);
    return soma / progressoList.length;
  }
}
