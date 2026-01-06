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

@ApiTags("Sessoes")
@UseGuards(JwtAuthGuard)
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
  @UseGuards(RolesGuard, ProfissionalExistsGuard)
  @Post()
  create(@Body() createSessoeDto: CreateSessaoDto, @Req() req: any) {
    const profissional = req.profissional;
    return this.sessoesService.create(createSessoeDto, profissional.id);
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
  @UseGuards(RolesGuard, ProfissionalExistsGuard)
  @Get()
  findAll(@Query() filterSessoesDto: FilterSessoesDto, @Req() req: any) {
    const profissional = req.profissional;
    return this.sessoesService.findAll(profissional.id, filterSessoesDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.sessoesService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSessoeDto: UpdateSessaoDto) {
    return this.sessoesService.update(+id, updateSessoeDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sessoesService.remove(+id);
  }
}
