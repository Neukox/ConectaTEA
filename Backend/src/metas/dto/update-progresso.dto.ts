import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateProgressoDto {
  @ApiProperty({
    example: "Nova descrição da meta",
    description: "Descrição atualizada da meta",
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descricao?: string;

  @ApiProperty({
    example: 75,
    description: "Progresso atualizado da meta (0 a 100)",
  })
  @IsInt()
  @Min(0)
  @Max(100)
  progresso: number;
}
