import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfissionalExistsGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    console.log('ProfissionalExistsGuard: Verificando profissional para userId:', userId);

    if (!userId) {
      throw new NotFoundException('Usuário não autenticado.');
    }

    const profissional = await this.prisma.profissional.findUnique({
      where: { usuario_id: userId },
      select: { id: true, usuario_id: true, especialidade: true },
    });

    if (!profissional) {
      throw new NotFoundException(
        'Profissional não encontrado para este usuário.',
      );
    }

    // Adicionar profissional ao request para uso posterior
    request.profissional = profissional;

    return true;
  }
}