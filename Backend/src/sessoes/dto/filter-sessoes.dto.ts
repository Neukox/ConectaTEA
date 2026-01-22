import { StatusSessao, TipoSessao } from "@prisma/client";
import { Periodos, PeriodoType } from "../../common/constants/periodo.constant";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FilterSessoesDto {
  @ApiProperty({
    example: 1,
    description: "ID da criança para filtrar as sessões",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  criancaId?: number;

  @ApiProperty({
    example: "AGENDADA",
    description: "Status da sessão",
    required: false,
  })
  @IsOptional()
  @IsEnum(StatusSessao)
  @Transform(({ value }) => value.replace(/ /g, "_").toUpperCase())
  status?: StatusSessao;

  @ApiProperty({
    example: "TERAPIA_OCUPACIONAL",
    description: "Tipo da sessão",
    required: false,
  })
  @IsOptional()
  @IsEnum(TipoSessao)
  @Transform(({ value }) => value.replace(/ /g, "_").toUpperCase())
  tipo?: TipoSessao;

  @ApiProperty({
    example: "HOJE",
    description: "Período para filtrar as sessões",
    required: false,
  })
  @IsOptional()
  @IsEnum(Periodos)
  @Transform(({ value }) => value.toUpperCase())
  periodo?: PeriodoType;

  @ApiProperty({
    example: "Avaliacao de rotina",
    description: "Termo de busca para filtrar sessões",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
