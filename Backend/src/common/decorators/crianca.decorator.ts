import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const Crianca = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const crianca = request.crianca;

    return data ? crianca?.[data] : crianca;
  },
);
