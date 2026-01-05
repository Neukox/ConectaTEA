import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { MetasService } from "./metas.service";
import { Roles } from "../auth/roles.decorator";
import { ProfissionalExistsGuard } from "../profissionais/guards/profissional-exists.guard";
import { CreateMetaDto } from "./dto/create-meta.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FilterMetasDto } from "./dto/filter-metas.dto";
import { AcessoMeta } from "./decorators/acesso-meta.decorator";
import { IdParamPipe } from "../common/pipes/id-param.pipe";
import { UpdateProgressoDto } from "./dto/update-progresso.dto";
import { UpdateMetaDto } from "./dto/update-meta.dto";

@ApiTags("Metas")
@Controller("metas")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MetasController {
  constructor(private readonly metasService: MetasService) {}

  @ApiOperation({ summary: "Cadastrar nova meta" })
  @ApiResponse({ status: 201, description: "Meta cadastrada com sucesso." })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiBearerAuth()
  @Post()
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  async create(@Body() createMetaDto: CreateMetaDto, @Req() req: any) {
    const profissional = req.profissional;
    return this.metasService.create(createMetaDto, profissional.id);
  }

  @ApiOperation({ summary: "Listar todas as metas" })
  @ApiResponse({
    status: 200,
    description: "Lista de metas retornada com sucesso.",
  })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiBearerAuth()
  @Get()
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  async findAll(@Req() req: any, @Query() filterMetasDto: FilterMetasDto) {
    const profissional = req.profissional;
    return await this.metasService.findAll(filterMetasDto, profissional.id);
  }

  @ApiOperation({ summary: "Obter detalhes de uma meta" })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiResponse({ status: 404, description: "Meta não encontrada." })
  @ApiBearerAuth()
  @Get(":id")
  @AcessoMeta(["PROFISSIONAL", "RESPONSAVEL"])
  async findOne(@Param("id", IdParamPipe) id: number) {
    return await this.metasService.findOne(id);
  }

  @ApiOperation({ summary: "Atualizar uma meta" })
  @ApiResponse({
    status: 200,
    description: "Meta atualizada com sucesso.",
  })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiResponse({ status: 404, description: "Meta não encontrada." })
  @ApiBearerAuth()
  @AcessoMeta(["PROFISSIONAL"])
  @Put(":id")
  async update(
    @Param("id", IdParamPipe) id: number,
    @Body() updateMetaDto: UpdateMetaDto
  ) {
    return await this.metasService.update(id, updateMetaDto);
  }

  @ApiOperation({ summary: "Atualizar progresso de uma meta" })
  @ApiResponse({
    status: 200,
    description: "Progresso da meta atualizado com sucesso.",
  })
  @ApiResponse({ status: 400, description: "Dados inválidos." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiResponse({ status: 404, description: "Meta não encontrada." })
  @ApiBearerAuth()
  @AcessoMeta(["PROFISSIONAL"])
  @Patch(":id/progresso")
  async updateProgresso(
    @Param("id", IdParamPipe) id: number,
    @Body() dto: UpdateProgressoDto
  ) {
    return await this.metasService.updateProgresso(id, dto);
  }
}
