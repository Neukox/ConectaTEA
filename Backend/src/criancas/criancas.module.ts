import { Module } from "@nestjs/common";
import { CriancasService } from "./criancas.service";
import { CriancasController } from "./criancas.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { TokenVinculoModule } from "../token-vinculo/token-vinculo.module";
import { VinculacaoModule } from "../vinculacao/vinculacao.module";

@Module({
  imports: [PrismaModule, VinculacaoModule, TokenVinculoModule],
  controllers: [CriancasController],
  providers: [CriancasService],
  exports: [CriancasService],
})
export class CriancasModule {}
