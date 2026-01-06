import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateSessaoDto } from "./dto/create-sessao.dto";
import { UpdateSessaoDto } from "./dto/update-sessao.dto";
import { PrismaService } from "../prisma/prisma.service";
import DateUtils from "../common/utils/date.utils";
import { FilterSessoesDto } from "./dto/filter-sessoes.dto";
import { Prisma } from "@prisma/client";
import { UpdateStatusSessaoDto } from "./dto/update-status-sessao.dto";

@Injectable()
export class SessoesService {
  private readonly logger = new Logger(SessoesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createSessaoDto: CreateSessaoDto, profissionalId: number) {
    this.logger.log(`Criando sessão para o profissional ID: ${profissionalId}`);

    this.logger.debug(`Data da sessão recebida: ${createSessaoDto.data}`);

    const sessao = await this.prisma.sessoes.create({
      data: {
        crianca_id: createSessaoDto.criancaId,
        data: createSessaoDto.data,
        tipo: createSessaoDto.tipoSessao,
        descricao: createSessaoDto.descricao,
        profissional_id: profissionalId,
        duracao: createSessaoDto.duracao,
        observacoes: createSessaoDto.observacoes,
      },
    });

    this.logger.log(`Sessão criada com ID: ${sessao.id}`);

    return {
      message: "Sessão criada com sucesso",
      sessao: sessao,
    };
  }

  async findAll(profissionalId: number, filters: FilterSessoesDto) {
    this.logger.log("Recuperando todas as sessões");

    const { startDate, endDate } = DateUtils.periodToDateRange(filters.periodo);

    const where: Prisma.SessoesWhereInput = {
      profissional_id: profissionalId,
      ...(filters.criancaId && { crianca_id: filters.criancaId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.tipo && { tipo: filters.tipo }),
      ...(filters.periodo && {
        data: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const sessoes = await this.prisma.sessoes.findMany({
      where,
      include: {
        crianca: {
          select: {
            nome: true,
          },
        },
        profissional: {
          select: {
            usuario: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Total de sessões encontradas: ${sessoes.length}`);

    const formattedSessoes = sessoes.map((sessao) => ({
      id: sessao.id,
      descricao: sessao.descricao,
      data: DateUtils.localeDate(sessao.data),
      duracao: sessao.duracao,
      tipo: sessao.tipo,
      status: sessao.status,
      observacoes: sessao.observacoes,
      crianca: {
        id: sessao.crianca_id,
        nome: sessao.crianca.nome,
      },
      profissional: {
        id: sessao.profissional_id,
        nome: sessao.profissional.usuario.name,
      },
    }));

    return formattedSessoes;
  }

  async getResumo(profissionalId: number) {
    this.logger.log("Calculando resumo das sessões");

    const sessoes = await this.findAll(profissionalId, {});

    const totalSessoesCount = sessoes.length;

    const sessoesConcluidas = sessoes.filter(
      (sessao) => sessao.status === "CONCLUIDA"
    ).length;

    const sessoesPendentes = sessoes.filter(
      (sessao) => sessao.status === "PENDENTE"
    ).length;

    const sessoesEstaSemana = sessoes.filter((sessao) => {
      const { startDate, endDate } = DateUtils.periodToDateRange("SEMANAL");

      const sessaoDate = new Date(sessao.data);

      return sessaoDate >= startDate && sessaoDate <= endDate;
    }).length;

    this.logger.log("Resumo calculado com sucesso");

    return {
      totalSessoesCount,
      sessoesConcluidas,
      sessoesEstaSemana,
      sessoesPendentes,
    };
  }

  async findOne(id: number) {
    this.logger.log(`Recuperando sessão com ID: ${id}`);

    const sessao = await this.prisma.sessoes.findUnique({
      where: { id },
    });

    return sessao;
  }

  async update(id: number, updateSessaoDto: UpdateSessaoDto) {
    this.logger.log(`Atualizando sessão com ID: ${id}`);
    const sessao = await this.findOne(id);

    if (!sessao) {
      this.logger.warn(`Sessão com ID: ${id} não encontrada para atualização`);
      throw new NotFoundException(`Sessão não encontrada`);
    }

    await this.prisma.sessoes.update({
      where: { id },
      data: {
        descricao: updateSessaoDto.descricao,
        data: updateSessaoDto.data,
        duracao: updateSessaoDto.duracao,
        tipo: updateSessaoDto.tipoSessao,
        observacoes: updateSessaoDto.observacoes,
      },
    });

    this.logger.log(`Sessão com ID: ${id} atualizada com sucesso`);

    return { message: "Sessão atualizada com sucesso" };
  }

  async updateStatus(id: number, updateStatusSessaoDto: UpdateStatusSessaoDto) {
    this.logger.log(
      `Atualizando status da sessão com ID: ${id} para ${updateStatusSessaoDto.status}`
    );
    const sessao = await this.findOne(id);

    if (!sessao) {
      this.logger.warn(
        `Sessão com ID: ${id} não encontrada para atualização de status`
      );
      throw new NotFoundException(`Sessão não encontrada`);
    }

    await this.prisma.sessoes.update({
      where: { id },
      data: {
        status: updateStatusSessaoDto.status,
      },
    });

    this.logger.log(
      `Status da sessão com ID: ${id} atualizado para ${updateStatusSessaoDto.status} com sucesso`
    );

    return { message: "Status da sessão atualizado com sucesso" };
  }

  async remove(id: number) {
    this.logger.log(`Removendo sessão com ID: ${id}`);

    const sessao = await this.findOne(id);

    if (!sessao) {
      this.logger.warn(`Sessão com ID: ${id} não encontrada para remoção`);
      throw new NotFoundException(`Sessão não encontrada`);
    }

    await this.prisma.sessoes.delete({
      where: { id },
    });

    this.logger.log(`Sessão com ID: ${id} removida com sucesso`);

    return { message: "Sessão removida com sucesso" };
  }
}
