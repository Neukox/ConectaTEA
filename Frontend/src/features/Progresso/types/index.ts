import type { Periodo } from '~/api/types'
import { CategoriaMeta } from '~/features/Metas/types'

export interface EvolucaoPorCategoriaData
  extends Record<CategoriaMeta, number> {
  periodo: string
}

export interface DistribuicaoPorCategoriaData
  extends Record<CategoriaMeta, number> {}

export interface ProgressoCriancaData {
  nome: string
  progresso: number
}

export interface ProgressoRecente {
  id: number
  data: Date
  descricao: string
  diferenca: number
  progresso_atual: number
  meta: {
    id: number
    titulo: string
  }
  crianca: string
  profissional: {
    titulo: string
    nome: string
  }
}

export interface ProgressoStats {
  media_progresso: number
  metas_ativas: number
  metas_concluidas: number
  criancas_ativas: number
}

export interface ProgressoFilters {
  periodo?: Periodo
}
