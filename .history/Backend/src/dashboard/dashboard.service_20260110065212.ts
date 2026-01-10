import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { startOfMonth, startOfWeek } from "date-fns";
import DateUtils from "../common/utils/date.utils";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obterEstatisticasProfissional(profissionalId: number) {
    try {
      // Obter todas as crianças vinculadas ao profissional
      const criancas = await this.prisma.profissionalCriança.findMany({
        where: { profissional_id: profissionalId, status_vinculo: "VINCULADO" },
        select: { crianca_id: true },
      });

      // Pegar ids das crianças
      const criancaIds = criancas.map((c) => c.crianca_id);

      // Total de crianças vinculadas
      const totalCriancas = criancaIds.length;

      // Início do mês atual para estatísticas mensais
      const inicioMes = startOfMonth(new Date());

      // Crianças vinculadas neste mês
      const criancasEsteMes = await this.prisma.profissionalCriança.count({
        where: {
          profissional_id: profissionalId,
          status_vinculo: "VINCULADO",
          data_vinculo: { gte: inicioMes },
        },
      });

      // Total de profissionais ativos (com vínculos aceitos)
      const profissionaisAtivos = await this.prisma.conexaoProfissional.count({
        where: {
          OR: [
            { solicitado_id: profissionalId },
            { solicitante_id: profissionalId },
          ],
          status: "ACEITO",
        },
      });

      // Total de profissionais ativos este mês
      const profissionaisAtivosEsteMes =
        await this.prisma.conexaoProfissional.count({
          where: {
            OR: [
              { solicitado_id: profissionalId },
              { solicitante_id: profissionalId },
            ],
            status: "ACEITO",
            criado_em: { gte: inicioMes },
          },
        });

      // Total de metas estabelecidas e não concluídas para as crianças vinculadas
      const totalMetas = await this.prisma.meta.count({
        where: {
          crianca_id: { in: criancaIds },
          status: { not: "CONCLUIDA" },
        },
      });

      const inicioSemana = startOfWeek(new Date());

      // Total de metas estabelecidas este semana
      const totalMetasEsteMes = await this.prisma.meta.count({
        where: {
          crianca_id: { in: criancaIds },
          status: { not: "CONCLUIDA" },
          created_at: { gte: inicioSemana },
        },
      });

      // Total de progresso registrado para as crianças vinculadas
      const progressoMetas = await this.prisma.meta.findMany({
        where: {
          crianca_id: { in: criancaIds },
        },
        select: { progresso: true, updated_at: true },
      });

      const taxaProgresso =
        progressoMetas.length > 0
          ? progressoMetas.reduce((acc, meta) => {
              const progresso = meta.progresso || 0;
              return acc + progresso;
            }, 0) / progressoMetas.length
          : 0;

      // Percentual médio de progresso este mês
      const progressosEsteMes = progressoMetas.filter((meta) => {
        const progressoDate = meta.updated_at;
        return progressoDate && progressoDate >= inicioMes;
      });

      const taxaProgressoEsteMes =
        progressosEsteMes.length > 0
          ? progressosEsteMes.reduce((acc, meta) => {
              const progresso = meta.progresso || 0;
              return acc + progresso;
            }, 0) / progressosEsteMes.length
          : 0;

      return {
        totalCriancas,
        criancasEsteMes,
        profissionaisAtivos,
        profissionaisAtivosEsteMes,
        totalMetas,
        totalMetasEsteMes,
        taxaProgresso: taxaProgresso,
        taxaProgressoEsteMes: taxaProgressoEsteMes,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas do profissional:", error);
      throw error;
    }
  }

  async obterCriancasProfissional(profissionalId: number) {
    const criancas = await this.prisma.profissionalCriança.findMany({
      where: { profissional_id: profissionalId },
      orderBy: { data_vinculo: "desc" },
      take: 4,
      select: {
        status_vinculo: true,
        profissional: {
          select: {
            id: true,
            titulo: true,
            usuario: { select: { name: true } },
          },
        },
        crianca: {
          select: {
            id: true,
            nome: true,
            data_nascimento: true,
            diagnostico: true,
          },
        },
      },
    });

    return criancas.map((vinculo) => {
      let idade = 0;
      try {
        idade = DateUtils.calculateAge(vinculo.crianca.data_nascimento);
      } catch (error) {
        console.error(
          `Erro ao calcular idade para criança ${vinculo.crianca.id}:`,
          error
        );
        idade = 0;
      }

      return {
        id: vinculo.crianca.id,
        nome: vinculo.crianca.nome,
        idade: idade,
        diagnostico: vinculo.crianca.diagnostico,
        status: vinculo.status_vinculo,
        profissional: (vinculo.profissional.titulo || "").concat(
          " ",
          vinculo.profissional.usuario?.name || ""
        ),
      };
    });
  }

  async obterMetasProfissional(profissionalId: number) {
    try {
      // Obter crianças vinculadas ao profissional
      const criancas = await this.prisma.meta.findMany({
        where: { profissional_id: profissionalId },
        orderBy: { updated_at: "desc" },
        take: 4,
        select: {
          id: true,
          titulo: true,
          status: true,
          progresso: true,
          crianca: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      return criancas.map((meta) => ({
        id: meta.id,
        titulo: meta.titulo,
        status: meta.status,
        progresso: meta.progresso,
        crianca: meta.crianca.nome,
      }));
    } catch (error) {
      console.error("Erro ao obter metas do profissional:", error);
      throw error;
    }
  }
}
