import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsEnum } from "class-validator";
import { Periodos } from "../../common/constants/periodo.constant";
import { Transform } from "class-transformer";

const FilterProgressosPeriodos = {
  SEMESTRAL: "SEMESTRAL",
  ANUAL: "ANUAL",
} satisfies Pick<typeof Periodos, "SEMESTRAL" | "ANUAL">;

type FilterProgressosPeriodos = keyof typeof FilterProgressosPeriodos;

export class FilterProgressosDto {
  @ApiPropertyOptional({
    description:
      "Período para o qual a evolução deve ser calculada. Valores possíveis: SEMESTRAL, ANUAL.",
    enum: Periodos,
  })
  @IsOptional()
  @IsEnum(FilterProgressosPeriodos)
  @Transform(({ value }) => (value ? value.toUpperCase() : value))
  periodo?: FilterProgressosPeriodos;
}
