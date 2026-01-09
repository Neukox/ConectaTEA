import type { StatusVinculoProfissionalCrianca } from "~/features/Criancas/types"
import type { StatusMeta } from "~/features/Metas/types"

export interface DadosDashboard {
  totalCriancas: number
  criancasEsteMes: number
  profissionaisAtivos: number
  profissionaisAtivosEsteMes: number
  totalMetas: number
  totalMetasEsteMes: number
  taxaProgresso: number
  taxaProgressoEsteMes: number
}

export interface DadosCriancasDashboard {
  id: number
  nome: string
  idade: number
  status: StatusVinculoProfissionalCrianca
  diagnostico: string
  profissional: string
}

export interface DadosMetasDashboard {
  id: number
  titulo: string
  status: StatusMeta
  progresso: number
  crianca: string
}