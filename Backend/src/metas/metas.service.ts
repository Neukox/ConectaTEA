import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMetaDto } from "./dto/create-meta.dto";
import { FilterMetasDto } from "./dto/filter-metas.dto";
import DateUtils from "../common/utils/date.utils";
import { ProgressoService } from "../progresso/progresso.service";
import { UpdateProgressoDto } from "./dto/update-progresso.dto";
import { Meta, StatusMeta } from "@prisma/client";
import { UpdateMetaDto } from "./dto/update-meta.dto";

@Injectable()
export class MetasService {
  private readonly logger = new Logger(MetasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly progressoService: ProgressoService
  ) {}

  async create(dto: CreateMetaDto, profissionalId: number) {
    const startDate = new Date(dto.dataInicio);
    const endDate = new Date(dto.dataFim);

    this.logger.log(
      `Criando meta para crianca: ${dto.crianca_id}, com título: ${dto.titulo}`
    );

    const meta = await this.prisma.meta.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        categoria: dto.categoria,
        prioridade: dto.prioridade,
        crianca_id: dto.crianca_id,
        profissional_id: profissionalId,
        data_inicio: startDate,
        data_fim: endDate,
        updates: {
          create: {
            descricao: "Meta criada.",
            profissional_id: profissionalId,
            status: "EM_ANDAMENTO",
          },
        },
      },
    });

    return {
      message: "Meta criada com sucesso.",
    };
  }

  async findAll(filters: FilterMetasDto, profissionalId?: number) {
    this.logger.debug(
      `Buscando metas para profissional ID: ${profissionalId} com filtros: ${JSON.stringify(filters)}`
    );

    let periodoStart: Date | null = null;
    let periodoEnd: Date | null = null;

    if (filters.periodo) {
      const { startDate, endDate } = DateUtils.periodToDateRange(
        filters.periodo
      );
      periodoStart = startDate;
      periodoEnd = endDate;
    }

    const where: any = {
      profissional_id: profissionalId,
      ...(filters.categoria && { categoria: filters.categoria }),
      ...(filters.prioridade && { prioridade: filters.prioridade }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        OR: [{ titulo: { contains: filters.search, mode: "insensitive" } }],
      }),
    };

    if (periodoStart && periodoEnd) {
      where.updates = {
        some: {
          data: {
            gte: periodoStart,
            lte: periodoEnd,
          },
        },
      };
    }

    const metas = await this.prisma.meta.findMany({
      where,
      include: {
        updates: {
          select: {
            progressoAtual: true,
            progressoAnterior: true,
          },
        },
      },
      orderBy: {
        data_inicio: "desc",
      },
    });

    this.logger.log(
      `Encontradas ${metas.length} metas para o profissional ID: ${profissionalId}`
    );

    const metasComAtualizacoes = metas.map((meta) => {
      const atualizacoesProgresso = meta.updates.map((update) => {
        const diferenca = this.progressoService.calcularDiferencaProgresso(
          update.progressoAnterior,
          update.progressoAtual
        );

        return diferenca;
      });

      return {
        ...meta,
        updates: atualizacoesProgresso,
      };
    });

    return metasComAtualizacoes;
  }

  async getResumo(profissionalId: number) {
    this.logger.debug(`Obtendo resumo das metas`);

    const totalMetas = await this.prisma.meta.count({
      where: {
        profissional_id: profissionalId,
      },
    });

    const metasPorStatus = await this.prisma.meta.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const metasEmAndamento =
      metasPorStatus.find((meta) => meta.status === "EM_ANDAMENTO")?._count
        .status || 0;

    const metasQuaseConcluidas =
      metasPorStatus.find((meta) => meta.status === "QUASE_CONCLUIDA")?._count
        .status || 0;

    const metasVencendo =
      metasPorStatus.find((meta) => meta.status === "VENCENDO")?._count
        .status || 0;

    const metasConcluidas =
      metasPorStatus.find((meta) => meta.status === "CONCLUIDA")?._count
        .status || 0;

    const resumo = {
      totalMetas,
      metasEmAndamento: metasEmAndamento + metasQuaseConcluidas,
      metasVencendo,
      metasConcluidas,
    };

    this.logger.log(`Resumo das metas obtido com sucesso`);

    return resumo;
  }

  async findOne(id: number) {
    this.logger.debug(`Buscando meta ID: ${id}`);

    const meta = await this.prisma.meta.findFirst({
      where: {
        id,
      },
      include: {
        crianca: {
          select: {
            id: true,
            nome: true,
          },
        },
        profissional: {
          select: {
            id: true,
            usuario: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!meta) {
      this.logger.warn(`Meta ID: ${id} não encontrada.`);
      throw new NotFoundException(`Meta não encontrada.`);
    }

    const ultimoProgressoAtualizado =
      await this.progressoService.obterUltimoProgresso(meta.id);

    this.logger.log(`Meta ID: ${id} encontrada com sucesso.`);

    return {
      id: meta.id,
      titulo: meta.titulo,
      descricao: meta.descricao,
      categoria: meta.categoria,
      prioridade: meta.prioridade,
      status: meta.status,
      dataInicio: meta.data_inicio,
      dataFim: meta.data_fim,
      crianca: {
        id: meta.crianca.id,
        nome: meta.crianca.nome,
      },
      profissional: {
        id: meta.profissional.id,
        name: meta.profissional.usuario.name,
      },
      progresso: {
        atual: meta.progresso,
        data: ultimoProgressoAtualizado.data,
      },
    };
  }

  async update(id: number, dto: UpdateMetaDto) {
    this.logger.debug(`Atualizando meta ID: ${id}`);

    const meta = await this.findOne(id);

    await this.prisma.meta.update({
      where: { id },
      data: {
        titulo: dto.titulo ?? meta.titulo,
        descricao: dto.descricao ?? meta.descricao,
        categoria: dto.categoria ?? meta.categoria,
        prioridade: dto.prioridade ?? meta.prioridade,
        data_inicio: dto.dataInicio
          ? new Date(dto.dataInicio)
          : meta.dataInicio,
        data_fim: dto.dataFim ? new Date(dto.dataFim) : meta.dataFim,
      },
    });

    this.logger.log(`Meta ID: ${id} atualizada com sucesso.`);

    return { message: "Meta atualizada com sucesso." };
  }

  async updateProgresso(metaId: number, dto: UpdateProgressoDto) {
    this.logger.debug(`Atualizando progresso da meta ID: ${metaId}`);

    const meta = await this.findOne(metaId);

    const progressoAnterior = meta.progresso.atual;
    const progressoAtual = dto.progresso;

    const status = this.calcularStatus(dto.progresso, meta.dataFim);

    this.logger.debug(
      `Progresso da meta ID: ${metaId} atualizado de ${progressoAnterior} para ${progressoAtual}`
    );

    this.logger.debug(`Status da meta ID: ${metaId} atualizado para ${status}`);

    await this.prisma.meta.update({
      where: { id: metaId },
      data: {
        progresso: progressoAtual,
        status,
        updates: {
          create: {
            descricao: dto.descricao || "Progresso atualizado.",
            progressoAnterior,
            progressoAtual,
            profissional_id: meta.profissional.id,
            status,
          },
        },
      },
    });

    return { message: "Progresso da meta atualizado com sucesso." };
  }

  async remove(id: number) {
    this.logger.debug(`Removendo meta ID: ${id}`);

    const meta = await this.findOne(id);

    await this.prisma.meta.delete({
      where: { id: meta.id },
    });

    this.logger.log(`Meta ID: ${id} removida com sucesso.`);

    return { message: "Meta removida com sucesso." };
  }

  calcularStatus(progresso: number, dataFim: Date): StatusMeta {
    if (progresso === 100) return "CONCLUIDA";
    if (progresso >= 90 && progresso < 100) return "QUASE_CONCLUIDA";

    const diasRestantes = DateUtils.daysDifference(new Date(), dataFim);
    if (diasRestantes <= 7 && progresso < 90) return "VENCENDO";

    return "EM_ANDAMENTO";
  }

  countMetasByStatus(metas: Meta[]) {
    const metasMap: Record<StatusMeta, number> = {
      CONCLUIDA: 0,
      QUASE_CONCLUIDA: 0,
      VENCENDO: 0,
      EM_ANDAMENTO: 0,
    };

    const mapped = metas.reduce((acc, meta) => {
      acc[meta.status] = (acc[meta.status] || 0) + 1;
      return acc;
    }, metasMap);

    return mapped;
  }
}
