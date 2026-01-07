import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { startOfMonth, startOfWeek } from "date-fns";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obterEstatisticasProfissional(profissionalId: number) {
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
  }
}
