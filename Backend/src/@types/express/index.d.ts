import type * as express from "express";
import { ProfissionalRequest } from "../profissional-request.type";

declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      email: string;
      tipo: string;
    }

    interface Request {
      user?: User | undefined;
      profissional?: ProfissionalRequest | undefined;
    }
  }
}

export {};
