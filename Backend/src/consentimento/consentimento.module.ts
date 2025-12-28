import { Module } from "@nestjs/common";
import { ConsentimentoService } from "./consentimento.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [PrismaService],
  providers: [ConsentimentoService],
  exports: [ConsentimentoService],
})
export class ConsentimentoModule {}
