import { CategoriaMeta } from '~/features/Metas/types'

export interface EvolucaoPorCategoriaData
  extends Record<CategoriaMeta, number> {
  periodo: string
}

export interface DistribuicaoPorCategoriaData extends Record<CategoriaMeta, number> {}

export interface ProgressoCriancaData {
  nome: string
  progresso: number
}

export interface Atualizacao {
  nome: string
  meta: string
  aumento: string
  descricao: string
  profissional: string
  data: string
  progressoAtual: number
}

export interface ProgressoStats {
  media_progresso: number
  metas_ativas: number
  metas_concluidas: number
  criancas_ativas: number
}
