import { Meta } from "@prisma/client";

export interface MetasComCrianca extends Meta {
  crianca: {
    nome: string;
  };
}
