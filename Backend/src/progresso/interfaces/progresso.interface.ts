import { CategoriaMeta, Progresso } from "@prisma/client";

export interface ProgressoComCategoriaMeta extends Progresso {
  meta: {
    categoria: CategoriaMeta;
  };
}
