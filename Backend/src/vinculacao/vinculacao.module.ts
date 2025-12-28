import { Module } from "@nestjs/common";
import { VinculacaoService } from "./vinculacao.service";
import { VinculacaoController } from "./vinculacao.controller";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [PrismaService],
  controllers: [VinculacaoController],
  providers: [VinculacaoService],
  exports: [VinculacaoService],
})
export class VinculacaoModule {}
