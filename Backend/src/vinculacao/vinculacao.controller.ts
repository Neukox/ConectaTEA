import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
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
import { VincularResponsavelDto } from "./dto/vincularResponsavel.dto";
import { User } from "../common/decorators/user.decorator";

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

  @ApiOperation({ summary: "Validar código de vinculação" })
  @ApiResponse({
    status: 200,
    description: "Código de vinculação validado com sucesso.",
  })
  @ApiResponse({
    status: 400,
    description: "Código de vinculação já utilizado.",
  })
  @ApiResponse({
    status: 400,
    description: "Código de vinculação cancelado.",
  })
  @ApiResponse({
    status: 400,
    description: "Código de vinculação expirado.",
  })
  @ApiResponse({
    status: 404,
    description: "Código de vinculação não encontrado.",
  })
  @ApiBearerAuth()
  @Roles("RESPONSAVEL")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("validar/:codigo")
  async validarCodigoVinculacao(
    @Param("codigo") codigo: string,
    @User("id") userId: number
  ) {
    return this.vinculacaoService.validarCodigoVinculacao(codigo, userId);
  }

  @ApiOperation({ summary: "Vincular responsável a uma criança" })
  @ApiResponse({
    status: 200,
    description: "Responsável vinculado à criança com sucesso.",
  })
  @ApiResponse({
    status: 404,
    description:
      "Código de vinculação inválido ou não validado para vincular responsável.",
  })
  @ApiResponse({
    status: 400,
    description: "Consentimento para vinculação não foi aceito.",
  })
  @ApiBearerAuth()
  @Roles("RESPONSAVEL")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("vincular")
  async vincularResponsavel(
    @Body() vincularResponsavelDto: VincularResponsavelDto
  ) {
    return this.vinculacaoService.vincularResponsavelACrianca(
      vincularResponsavelDto
    );
  }
}
