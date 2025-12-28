import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { VinculacaoService } from "./vinculacao.service";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { IdParamPipe } from "../common/pipes/id-param.pipe";

@ApiTags("Vinculação")
@Controller("vinculacao")
export class VinculacaoController {
  constructor(private readonly vinculacaoService: VinculacaoService) {}

  @ApiOperation({ summary: "Buscar histórico de vinculações de uma criança" })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({
    status: 400,
    description:
      "Histórico de vinculações não encontrado para a criança especificada.",
  })
  @ApiBearerAuth()
  @Roles("PROFISSIONAL", "RESPONSAVEL")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("historico/:criancaId")
  async getHistoricoVinculacoes(
    @Param("criancaId", IdParamPipe) criancaId: number
  ) {
    return this.vinculacaoService.buscarHistoricoVinculacoes(criancaId);
  }
}
