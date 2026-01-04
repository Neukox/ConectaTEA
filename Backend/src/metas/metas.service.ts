import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMetaDto } from "./dto/create-meta.dto";

@Injectable()
export class MetasService {
  private readonly logger = new Logger(MetasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMetaDto, profissionalId: number) {
    const startDate = new Date(dto.dataInicio);
    const endDate = new Date(dto.dataFim);

    this.logger.log(
      `Criando meta para crianca: ${dto.crianca_id}, com título: ${dto.titulo}`
    );

    const meta = this.prisma.meta.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        categoria: dto.categoria,
        prioridade: dto.prioridade,
        crianca_id: dto.crianca_id,
        profissional_id: profissionalId,
        data_inicio: startDate,
        data_fim: endDate,
      },
      include: {
        profissional: true,
        crianca: true,
      },
    });

    return {
      message: "Meta criada com sucesso.",
    };
  }
}
