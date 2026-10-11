import type { StatusMeta } from "~/features/Metas/types"

export interface DadosDashboard {
  totalCriancas: number
  criancasEsteMes: number
  profissionaisAtivos: number
  profissionaisAtivosEsteMes: number
  totalMetas: number
  metasAtivas: number
  totalMetasEsteMes: number
  progressoAtual: ResumoProgressoAtual
  progressoAtualEsteMes: ResumoProgressoAtual
  sessoesSemana: number
  notificacoesNaoLidas: number
}

export interface ResumoProgressoAtual {
  media: number | null
  metasComDados: number
  metasSemDados: number
  metasPausadas: number
  metasConcluidas: number
}

export interface DadosCriancasDashboard {
  id: number
  nome: string
  idade: number
  diagnostico?: string | null
}

export interface DadosMetasDashboard {
  id: number
  titulo: string
  status: StatusMeta
  progresso: number
  crianca: string
}

export interface DadosDashboardResponsavel {
  totalCriancas: number
  metasAtivas: number
  sessoesSemana: number
  sessoesProximas: number
  notificacoesNaoLidas: number
  progressoAtual: ResumoProgressoAtual
}
