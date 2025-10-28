import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CriancasService } from './criancas.service';
import { CreateCriancaDto } from './dto/create-crianca.dto';
import { UpdateCriancaDto } from './dto/update-crianca.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Crianças')
@Controller('criancas')
export class CriancasController {
  constructor(private readonly criancasService: CriancasService) {}

  @ApiOperation({ summary: 'Cadastrar nova criança' })
  @ApiResponse({ status: 201, description: 'Criança cadastrada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCriancaDto: CreateCriancaDto, @Req() req: any) {
    return await this.criancasService.create(createCriancaDto, req.user?.id);
  }

  @ApiOperation({ summary: 'Listar todas as crianças' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: any) {
    return await this.criancasService.findAll();
  }

  @ApiOperation({ summary: 'Buscar criança por ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const criancaId = parseInt(id);
    if (isNaN(criancaId)) {
      throw new BadRequestException('ID deve ser um número válido.');
    }
    return await this.criancasService.findOne(criancaId);
  }

  @ApiOperation({ summary: 'Atualizar criança' })
  @ApiResponse({ status: 200, description: 'Criança atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Criança não encontrada.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCriancaDto: UpdateCriancaDto, @Req() req: any) {
    const criancaId = parseInt(id);
    if (isNaN(criancaId)) {
      throw new BadRequestException('ID deve ser um número válido.');
    }
    return await this.criancasService.update(criancaId, updateCriancaDto);
  }

  @ApiOperation({ summary: 'Deletar criança' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.criancasService.remove(+id);
  }
}
