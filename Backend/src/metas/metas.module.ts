import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MetasService } from './metas.service';
import { MetasController } from './metas.controller';

@Module({
  imports: [PrismaModule],
  providers: [MetasService],
  controllers: [MetasController],
  exports: [MetasService],
})
export class MetasModule {}
