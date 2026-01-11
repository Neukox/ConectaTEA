import { forwardRef, Module } from "@nestjs/common";
import { ProgressoService } from "./progresso.service";
import { PrismaModule } from "../prisma/prisma.module";
import { ProgressoController } from "./progresso.controller";
import { MetasModule } from "../metas/metas.module";

@Module({
  imports: [PrismaModule, forwardRef(() => MetasModule)],
  providers: [ProgressoService],
  controllers: [ProgressoController],
  exports: [ProgressoService],
})
export class ProgressoModule {}
