import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProgressoService {
  constructor(private readonly prisma: PrismaService) {}

  calcularDiferencaProgresso(
    progressoAnterior: number,
    progressoAtual: number
  ): number {
    return progressoAtual - progressoAnterior;
  }
}
