import { Controller, Get, Query, UseGuards, BadRequestException, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfissionaisService } from './profissionais.service';
import { UpdateProfissionalDto } from './dto/update-profissional.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Profissionais')
@Controller('profissionais')
export class ProfissionaisController {
  constructor(private readonly profissionaisService: ProfissionaisService) {}

  @ApiOperation({ summary: 'Listar todos os profissionais' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('usuarioId') usuarioId?: string) {
    // Se usuarioId foi fornecido, buscar apenas esse profissional
    if (usuarioId) {
      const userId = parseInt(usuarioId);
      if (isNaN(userId)) {
        throw new BadRequestException('usuarioId deve ser um número válido.');
      }
      const profissional = await this.profissionaisService.findByUserId(userId);
      // Retorna array vazio se não encontrou, para manter compatibilidade
      return profissional ? [profissional] : [];
    }

    // Caso contrário, listar todos
    return await this.profissionaisService.findAll();
  }

  @ApiOperation({ summary: 'Atualizar perfil profissional por ID do usuário' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('usuario/:usuarioId')
  async updateByUserId(@Param('usuarioId') usuarioId: string, @Body() updateProfissionalDto: UpdateProfissionalDto) {
    const userId = parseInt(usuarioId);
    if (isNaN(userId)) {
      throw new BadRequestException('usuarioId deve ser um número válido.');
    }
    return await this.profissionaisService.updateByUserId(userId, updateProfissionalDto);
  }
}
