import { Module } from "@nestjs/common";
import { TokenVinculoService } from "./token-vinculo.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [TokenVinculoService],
  exports: [TokenVinculoService],
})
export class TokenVinculoModule {}
