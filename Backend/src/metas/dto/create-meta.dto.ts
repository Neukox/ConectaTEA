import { CategoriaMeta, PrioridadeMeta } from "@prisma/client";
import {
  IsDate,
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { IsNotPastDate } from "../../common/decorators/is-not-past-date.decorator";
import { IsNotBeforeDate } from "../../common/decorators/is-not-before-date.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateMetaDto {
  @ApiProperty({ example: "Aprender a ler", description: "Título da meta" })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  titulo: string;

  @ApiProperty({ example: "COMUNICACAO", description: "Categoria da meta" })
  @IsEnum(CategoriaMeta)
  categoria: CategoriaMeta;

  @ApiProperty({ example: "ALTA", description: "Prioridade da meta" })
  @IsEnum(PrioridadeMeta)
  prioridade: PrioridadeMeta;

  @ApiProperty({ example: 1, description: "ID da criança associada à meta" })
  @IsInt()
  @Min(1, {})
  crianca_id: number;

  @ApiProperty({ example: "2024-07-01", description: "Data de início da meta" })
  @Type(() => Date)
  @IsDate()
  @IsNotPastDate()
  data_inicio: Date;

  @ApiProperty({ example: "2024-10-01", description: "Data de fim da meta" })
  @Type(() => Date)
  @IsDate()
  @IsNotBeforeDate("data_inicio")
  data_fim: Date;

  @ApiProperty({
    example: "A criança deve ser capaz de ler livros simples.",
    description: "Descrição da meta",
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @IsOptional()
  descricao: string;
}
