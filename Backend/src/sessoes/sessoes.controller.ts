import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from "@nestjs/common";
import { SessoesService } from "./sessoes.service";
import { CreateSessaoDto } from "./dto/create-sessao.dto";
import { UpdateSessaoDto } from "./dto/update-sessao.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ProfissionalExistsGuard } from "../profissionais/guards/profissional-exists.guard";
import { FilterSessoesDto } from "./dto/filter-sessoes.dto";
import { IdParamPipe } from "../common/pipes/id-param.pipe";
import SessoesGuard from "./guards/sessoes.guard";
import { UpdateStatusSessaoDto } from "./dto/update-status-sessao.dto";
import { Profissional } from "../common/decorators/profissional.decorator";

@ApiTags("Sessoes")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("sessoes")
export class SessoesController {
  constructor(private readonly sessoesService: SessoesService) {}

  @ApiOperation({ summary: "Cadastrar nova sessão" })
  @ApiResponse({ status: 201, description: "Sessão cadastrada com sucesso." })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiBearerAuth()
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  @Post()
  async create(
    @Body() createSessaoDto: CreateSessaoDto,
    @Profissional("id") profissionalId: number
  ) {
    return await this.sessoesService.create(createSessaoDto, profissionalId);
  }

  @ApiOperation({ summary: "Listar todas as sessões" })
  @ApiResponse({
    status: 200,
    description: "Lista de sessões recuperada com sucesso.",
  })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiBearerAuth()
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  @Get()
  async findAll(
    @Query() filterSessoesDto: FilterSessoesDto,
    @Profissional("id") profissionalId: number
  ) {
    return await this.sessoesService.findAll(profissionalId, filterSessoesDto);
  }

  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  @Get("resumo")
  async resumo(@Profissional("id") profissionalId: number) {
    return await this.sessoesService.getResumo(profissionalId);
  }

  @ApiOperation({ summary: "Atualizar uma sessão" })
  @ApiResponse({ status: 200, description: "Sessão atualizada com sucesso." })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiBearerAuth()
  @Roles("PROFISSIONAL")
  @UseGuards(SessoesGuard)
  @Put(":id")
  async update(
    @Param("id", IdParamPipe) id: number,
    @Body() updateSessaoDto: UpdateSessaoDto
  ) {
    return await this.sessoesService.update(id, updateSessaoDto);
  }

  @ApiOperation({ summary: "Atualizar status de uma sessão" })
  @ApiResponse({
    status: 200,
    description: "Status da sessão atualizado com sucesso.",
  })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiResponse({ status: 404, description: "Sessão não encontrada." })
  @ApiBearerAuth()
  @Roles("PROFISSIONAL")
  @UseGuards(SessoesGuard)
  @Patch(":id/status")
  async updateStatus(
    @Param("id", IdParamPipe) id: number,
    @Body() updateStatusSessaoDto: UpdateStatusSessaoDto
  ) {
    return await this.sessoesService.updateStatus(id, updateStatusSessaoDto);
  }

  @ApiOperation({ summary: "Remover uma sessão" })
  @ApiResponse({ status: 200, description: "Sessão removida com sucesso." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiResponse({ status: 404, description: "Sessão não encontrada." })
  @ApiBearerAuth()
  @Roles("PROFISSIONAL")
  @UseGuards(SessoesGuard)
  @Delete(":id")
  remove(@Param("id", IdParamPipe) id: number) {
    return this.sessoesService.remove(id);
  }
}
