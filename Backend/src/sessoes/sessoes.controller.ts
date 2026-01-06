import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
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
  async create(@Body() createSessaoDto: CreateSessaoDto, @Req() req: any) {
    const profissional = req.profissional;
    return await this.sessoesService.create(createSessaoDto, profissional.id);
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
  async findAll(@Query() filterSessoesDto: FilterSessoesDto, @Req() req: any) {
    const profissional = req.profissional;
    return await this.sessoesService.findAll(profissional.id, filterSessoesDto);
  }

  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  @Get("resumo")
  async resumo(@Req() req: any) {
    const profissional = req.profissional;
    return await this.sessoesService.getResumo(profissional.id);
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

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sessoesService.remove(+id);
  }
}
