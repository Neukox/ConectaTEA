import { Module } from "@nestjs/common";
import { TokenVinculoService } from "./token-vinculo.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [PrismaService],
  providers: [TokenVinculoService],
  exports: [TokenVinculoService],
})
export class TokenVinculoModule {}
