import { CategoriaMeta } from '~/features/Metas/types'

export interface EvolucaoPorCategoriaData
  extends Record<CategoriaMeta, number> {
  periodo: string
}

export type DistribuicaoPorCategoriaData = Record<CategoriaMeta, number>

export interface ProgressoCriancaData {
  nome: string
  progresso: number
}

export interface ProgressoRecente {
  id: number
  data: string
  descricao: string
  diferenca: number
  progressoAtual: number
  metaId: number
  metaTitulo: string
  criancaId: number
}

export interface ProgressoStats {
  mediaProgresso: number
  metasAtivas: number
  metasConcluidas: number
  criancasAtivas: number
}

export interface ProgressoFilters {
  criancaId?: number
  periodo?: 'SEMESTRAL' | 'ANUAL'
}
