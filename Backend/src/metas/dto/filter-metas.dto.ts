import { CategoriaMeta, PrioridadeMeta, StatusMeta } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Periodos, PeriodoType } from "../../common/constants/periodo.constant";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class FilterMetasDto {
  @ApiProperty({
    example: "COMUNICACAO",
    description: "Categoria da meta",
    required: false,
  })
  @IsOptional()
  @IsEnum(CategoriaMeta)
  @Transform(({ value }) => value.toUpperCase())
  categoria?: CategoriaMeta;

  @ApiProperty({
    example: "ALTA",
    description: "Prioridade da meta",
    required: false,
  })
  @IsOptional()
  @IsEnum(PrioridadeMeta)
  @Transform(({ value }) => value.toUpperCase())
  prioridade?: PrioridadeMeta;

  @ApiProperty({
    example: "VENCENDO",
    description: "Status da meta",
    required: false,
  })
  @IsOptional()
  @IsEnum(StatusMeta)
  @Transform(({ value }) => value.replace(/ /g, "_").toUpperCase())
  status?: StatusMeta;

  @ApiProperty({
    example: "MENSAL",
    description: "Período para filtro de metas",
    required: false,
  })
  @IsOptional()
  @IsEnum(Periodos)
  @Transform(({ value }) => value.toUpperCase())
  periodo?: PeriodoType;

  @ApiProperty({
    example: "ler livros",
    description: "Termo de busca no título ou descrição da meta",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  search?: string;
}
