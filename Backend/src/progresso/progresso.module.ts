import { Module } from '@nestjs/common';
import { ProgressoService } from './progresso.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProgressoService],
  exports: [ProgressoService],
})
export class ProgressoModule {}
