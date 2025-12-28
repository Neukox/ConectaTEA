import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ConsentimentoService {
  constructor(private readonly prismaService: PrismaService) {}

  async aceitarConsentimento(
    criancaId: number,
    responsavelId: number,
    profissionalId: number
  ) {
    return this.prismaService.consentimento.create({
      data: {
        crianca_id: criancaId,
        responsavel_id: responsavelId,
        profissional_id: profissionalId,
        aceito: true,
      },
    });
  }
}
