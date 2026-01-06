import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const Profissional = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const profissional = request.profissional;

    return data ? profissional?.[data] : profissional;
  }
);