import { useQuery } from "@tanstack/react-query";
import { getCriancasDashboardProfissional } from "../services";
import { QUERY_KEYS } from "~/api/query-client";
import type { DadosCriancasDashboard } from "../types";

export function useDashboardProfissionalCriancas() {
  return useQuery<DadosCriancasDashboard[]>({
    queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL_CRIANCAS],
    queryFn: getCriancasDashboardProfissional,
  });
}