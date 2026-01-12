import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/roles.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { ProfissionalExistsGuard } from "../profissionais/guards/profissional-exists.guard";
import { ProgressoService } from "./progresso.service";
import { Profissional } from "../common/decorators/profissional.decorator";
import { FilterProgressosDto } from "./dto/filter-progressos.dto";

@ApiTags("Progresso")
@Controller("progresso")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressoController {
  constructor(private readonly progressoService: ProgressoService) {}

  @ApiOperation({ summary: "Obter progressos recentes (para profissional)" })
  @ApiResponse({ status: 200, description: "Progresso obtido com sucesso." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 404, description: "Profissional não encontrado." })
  @Get("recentes")
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  progressosRecentes(@Profissional("id") id: number) {
    return this.progressoService.getProgressoRecentes(id);
  }

  @ApiOperation({ summary: "Obter resumo de progressos (para profissional)" })
  @ApiResponse({ status: 200, description: "Resumo obtido com sucesso." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 404, description: "Profissional não encontrado." })
  @Get("resumo")
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  async resumoProgressos(@Profissional("id") id: number) {
    return this.progressoService.getResumo(id);
  }

  @ApiOperation({ summary: "Obter evolução por categoria (para profissional)" })
  @ApiResponse({ status: 200, description: "Evolução obtida com sucesso." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 404, description: "Profissional não encontrado." })
  @Get("evolucao-categoria")
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  async evolucaoPorCategoria(
    @Profissional("id") id: number,
    @Query() filterProgressosDto?: FilterProgressosDto
  ) {
    return this.progressoService.obterEvolucaoPorCategoria(
      id,
      filterProgressosDto?.periodo
    );
  }

  @ApiOperation({ summary: "Obter distribuição por categoria (para profissional)" })
  @ApiResponse({ status: 200, description: "Distribuição obtida com sucesso." })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 404, description: "Profissional não encontrado." })
  @Get("distribuicao-categoria")
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  async distribuicaoPorCategoria(
    @Profissional("id") id: number,
    @Query() filterProgressosDto?: FilterProgressosDto
  ) {
    return this.progressoService.obterDistruibuicaoPorCategoria(
      id,
      filterProgressosDto?.periodo
    );
  }
}
