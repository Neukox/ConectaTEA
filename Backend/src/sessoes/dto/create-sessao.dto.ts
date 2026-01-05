import { TipoSessao } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { IsNotPastDate } from "../../common/decorators/is-not-past-date.decorator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSessaoDto {
  @ApiProperty({ example: 1, description: "ID da criança associada à sessão" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  criancaId: number;

  @ApiProperty({ example: "2026-01-15", description: "Data da sessão" })
  @Type(() => Date)
  @IsDate()
  @IsNotPastDate()
  data: Date;

  @ApiProperty({ example: 60, description: "Duração da sessão em minutos" })
  @Type(() => Number)
  @IsInt()
  duracao: number;

  @ApiProperty({
    example: "TERAPIA_OCUPACIONAL",
    description: "Tipo da sessão",
  })
  @IsEnum(TipoSessao)
  tipoSessao: TipoSessao;

  @ApiProperty({
    example: "Sessão focada em habilidades motoras finas.",
    description: "Descrição da sessão",
  })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  descricao: string;

  @ApiProperty({
    example: "Criança respondeu bem às atividades propostas.",
    description: "Observações adicionais sobre a sessão",
  })
  @IsString()
  @MaxLength(500)
  observacoes?: string;
}
