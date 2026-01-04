import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMetaDto } from "./dto/create-meta.dto";
import { FilterMetasDto } from "./dto/filter-metas.dto";
import DateUtils from "../common/utils/date.utils";
import { ProgressoService } from "../progresso/progresso.service";

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

  async findAll(filters: FilterMetasDto, profissionalId: number) {
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
      }
    });

    return metasComAtualizacoes;
  }
}
