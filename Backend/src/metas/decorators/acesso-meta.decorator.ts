import { applyDecorators, UseGuards } from "@nestjs/common";
import { UserType } from "@prisma/client";
import { Roles } from "../../auth/roles.decorator";
import { MetasGuard } from "../guards/metas.guard";

export const AcessoMeta = (tipos: UserType[]) => {
  return applyDecorators(Roles(...tipos), UseGuards(MetasGuard));
};
