import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProgressoService {
  constructor(private readonly prisma: PrismaService) {}

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
}
