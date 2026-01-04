import {
  Body,
  Controller,
  Get,
  Post,
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
}
