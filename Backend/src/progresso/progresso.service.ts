import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MetasService } from "../metas/metas.service";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CategoriaMeta, Prisma } from "@prisma/client";
import DateUtils from "../common/utils/date.utils";
import { PeriodoType } from "../common/constants/periodo.constant";
import { ProgressoComCategoriaMeta } from "./interfaces/progresso.interface";
import { MetasComCrianca } from "../metas/interfaces/metas.interface";

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

  async obterEvolucaoPorCategoria(
    profissionalId: number,
    periodo: PeriodoType = "SEMESTRAL"
  ) {
    this.logger.debug(
      `Obtendo evolução por categoria para profissional ID: ${profissionalId}`
    );

    const { startDate, endDate } = DateUtils.periodToDateRange(periodo);

    const progressos = await this.prisma.progresso.findMany({
      where: {
        profissional_id: profissionalId,
        data: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { meta: { select: { categoria: true } } },
    });

    const evolucao = this.calcularEvolucaoPorCategoria(
      progressos,
      startDate,
      endDate
    );

    this.logger.log(
      `Evolução por categoria obtida com sucesso para profissional ID: ${profissionalId}`
    );

    return evolucao;
  }

  async obterDistruibuicaoPorCategoria(
    profissionalId: number,
    periodo: PeriodoType = "SEMESTRAL"
  ) {
    this.logger.debug(
      `Obtendo distribuição por categoria para profissional ID: ${profissionalId}`
    );

    const { startDate, endDate } = DateUtils.periodToDateRange(periodo);

    const progressos = await this.obterProgressosComCategoriaMeta({
      profissional_id: profissionalId,
      data: {
        gte: startDate,
        lte: endDate,
      },
    });

    const distribuicao = this.calcularDistribuicaoPorCategoria(progressos);

    this.logger.log(
      `Distribuição por categoria obtida com sucesso para profissional ID: ${profissionalId}`
    );

    return distribuicao;
  }

  async obterProgressosPorCrianca(
    profissionalId: number,
    periodo: PeriodoType = "SEMESTRAL"
  ) {
    this.logger.debug(
      `Obtendo progressos por criança para profissional ID: ${profissionalId}`
    );

    const { startDate, endDate } = DateUtils.periodToDateRange(periodo);

    const metas = await this.prisma.meta.findMany({
      where: {
        profissional_id: profissionalId,
        created_at: { gte: startDate, lte: endDate },
      },
      include: {
        crianca: {
          select: {
            nome: true,
          },
        },
      },
    });

    const progressoPorCrianca = this.calcularMediaProgressosPorCrianca(metas);

    this.logger.log(
      `Progressos por criança obtidos com sucesso para profissional ID: ${profissionalId}`
    );

    return progressoPorCrianca;
  }

  async obterUltimoProgresso(metaId: number) {
    return this.prisma.progresso.findFirst({
      where: { meta_id: metaId },
      orderBy: { data: "desc" },
    });
  }

  async obterProgressosComCategoriaMeta(
    where: Prisma.ProgressoWhereInput
  ): Promise<ProgressoComCategoriaMeta[]> {
    const progressos = await this.prisma.progresso.findMany({
      where,
      include: {
        meta: {
          select: {
            categoria: true,
          },
        },
      },
    });

    return progressos;
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

  // Fazer calculo de evolução por categoria de meta
  calcularEvolucaoPorCategoria(
    progressos: ProgressoComCategoriaMeta[],
    dataInicio: Date,
    dataFim: Date
  ) {
    // Agrupar por categoria e calcular média de progresso
    const categorias = Object.values(CategoriaMeta);

    // Gerar série temporal mensal
    const meses = eachMonthOfInterval({ start: dataInicio, end: dataFim });

    const resultado = meses.map((mes) => {
      const periodo = format(mes, "MMM/yy", { locale: ptBR });

      const ponto: Record<string, any> = { periodo };

      // Filtrar progressos do mês
      const start = startOfMonth(mes);
      const end = endOfMonth(mes);

      const progressosNoMes = progressos.filter((progresso) => {
        return progresso.data >= start && progresso.data <= end;
      });

      // Calcular média por categoria
      categorias.forEach((categoria) => {
        const progressosCategoria = progressosNoMes.filter(
          (progresso) => progresso.meta.categoria === categoria
        );

        const progressoMedio =
          progressosCategoria.length > 0
            ? Math.round(
                progressosCategoria.reduce(
                  (sum, p) => sum + p.progressoAtual,
                  0
                ) / progressosCategoria.length
              )
            : 0;

        ponto[categoria] = progressoMedio;
      });

      return ponto;
    });

    return resultado;
  }

  calcularDistribuicaoPorCategoria(progressos: ProgressoComCategoriaMeta[]) {
    const distribuicao: Record<string, number> = {};

    Object.values(CategoriaMeta).forEach((categoria) => {
      const count = progressos.filter(
        (progresso) => progresso.meta.categoria === categoria
      ).length;

      distribuicao[categoria] = count;
    });

    return distribuicao;
  }

  calcularMediaProgressosPorCrianca(metas: MetasComCrianca[]) {
    const progressoPorCrianca = [];

    const nomes = metas.map((meta) => meta.crianca.nome);
    const criancas = new Set(nomes);

    criancas.forEach((nome) => {
      const metasCrianca = metas.filter((meta) => meta.crianca.nome === nome);

      const progressoMetas = metasCrianca.map((meta) => meta.progresso || 0);

      const progressoMedio = this.calcularMediaProgresso(progressoMetas);

      progressoPorCrianca.push({
        nome: nome,
        progresso: Math.round(progressoMedio),
      });
    });

    return progressoPorCrianca;
  }
}
