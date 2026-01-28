import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ProfissionalExistsGuard } from "../profissionais/guards/profissional-exists.guard";
import { Profissional } from "../common/decorators/profissional.decorator";
import VinculacaoResponsavelGuard from "../vinculacao/guards/vinculacao-responsavel.guard";
import { Crianca } from "../common/decorators/crianca.decorator";

@ApiTags("Dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: "Obter dados do dashboard do profissional" })
  @ApiResponse({
    status: 200,
    description: "Dados do dashboard obtidos com sucesso.",
  })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiResponse({ status: 404, description: "Profissional não encontrado." })
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  @Get("profissional")
  getProfissionalDashboardData(@Profissional("id") profissionalId: number) {
    return this.dashboardService.obterEstatisticasProfissional(profissionalId);
  }

  @ApiOperation({ summary: "Obter dados do dashboard do responsável" })
  @ApiResponse({
    status: 200,
    description: "Dados do dashboard obtidos com sucesso.",
  })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @Roles("RESPONSAVEL")
  @UseGuards(VinculacaoResponsavelGuard)
  @Get("responsavel")
  getResponsavelDashboardData(@Crianca("id") criancaId: number) {
    return this.dashboardService.obterEstatisticasCrianca(criancaId);
  }

  @ApiOperation({
    summary: "Obter dados das crianças vinculadas ao profissional",
  })
  @ApiResponse({
    status: 200,
    description: "Dados do dashboard obtidos com sucesso.",
  })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiResponse({ status: 404, description: "Profissional não encontrado." })
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  @Get("profissional/criancas")
  getCriancasVinculadas(@Profissional("id") profissionalId: number) {
    return this.dashboardService.obterCriancasProfissional(profissionalId);
  }

  @ApiOperation({ summary: "Obter dados das metas do profissional" })
  @ApiResponse({
    status: 200,
    description: "Dados das metas obtidos com sucesso.",
  })
  @ApiResponse({ status: 401, description: "Não autorizado." })
  @ApiResponse({ status: 403, description: "Acesso proibido." })
  @ApiResponse({ status: 404, description: "Profissional não encontrado." })
  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  @Get("profissional/metas")
  getMetasProfissional(@Profissional("id") profissionalId: number) {
    return this.dashboardService.obterMetasProfissional(profissionalId);
  }
}
