import { Module } from "@nestjs/common";
import { VinculacaoService } from "./vinculacao.service";
import { VinculacaoController } from "./vinculacao.controller";
import { TokenVinculoModule } from "../token-vinculo/token-vinculo.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, TokenVinculoModule],
  controllers: [VinculacaoController],
  providers: [VinculacaoService],
  exports: [VinculacaoService],
})
export class VinculacaoModule {}
