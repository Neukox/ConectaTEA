import { ApiProperty } from "@nestjs/swagger";
import { StatusSessao } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum } from "class-validator";

export class UpdateStatusSessaoDto {
  @ApiProperty({
    description: "Novo status da sessão",
    enum: StatusSessao,
  })
  @IsEnum(StatusSessao)
  @Transform(({ value }) => value.replace(/ /g, "_").toUpperCase())
  status: StatusSessao;
}
