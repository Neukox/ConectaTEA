import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ProfissionalExistsGuard } from "../profissionais/guards/profissional-exists.guard";
import { Profissional } from "../common/decorators/profissional.decorator";

@ApiTags("Dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles("PROFISSIONAL")
  @UseGuards(ProfissionalExistsGuard)
  @Get("profissional")
  getProfissionalDashboardData(@Profissional("id") profissionalId: number) {
    return this.dashboardService.obterEstatisticasProfissional(profissionalId);
  }
}
