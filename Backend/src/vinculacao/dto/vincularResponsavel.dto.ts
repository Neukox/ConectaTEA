import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber } from "class-validator";

export class VincularResponsavelDto {
  @ApiProperty({
    description: "Indica se o consentimento foi aceito",
    example: true,
  })
  @IsBoolean()
  consentimentoAceito: boolean;

  @ApiProperty({ description: "ID da criança a ser vinculada", example: 1 })
  @IsNumber()
  criancaId: number;

  @ApiProperty({
    description: "ID do responsável que está vinculando",
    example: 1,
  })
  @IsNumber()
  responsavelId: number;

  @ApiProperty({ description: "ID do profissional associado", example: 1 })
  @IsNumber()
  profissionalId: number;
}
