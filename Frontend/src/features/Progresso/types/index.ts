export interface EvolucaoData {
  name: string
  social: number
  comunicacao: number
  motora: number
  cognitiva: number
}

export interface DistribuicaoData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

export interface ProgressoCriancaData {
  name: string
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
