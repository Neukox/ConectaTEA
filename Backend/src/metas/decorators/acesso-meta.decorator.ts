import { applyDecorators, UseGuards } from "@nestjs/common";
import { UserType } from "@prisma/client";
import { Roles } from "../../auth/roles.decorator";
import { MetasGuard } from "../guards/metas.guard";

export const AcessoMeta = (tipo: UserType) => {
  return applyDecorators(Roles(tipo), UseGuards(MetasGuard));
};
