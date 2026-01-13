import type { UpdateMetaData } from '../schemas/update-meta.schema'

export type StatusMeta =
  | 'EM_ANDAMENTO'
  | 'VENCENDO'
  | 'QUASE_CONCLUIDA'
  | 'CONCLUIDA'

export type PrioridadeMeta = 'BAIXA' | 'MEDIA' | 'ALTA'

export type CategoriaMeta =
  | 'COMUNICACAO'
  | 'SOCIAL'
  | 'COGNITIVA'
  | 'COMPORTAMENTAL'
  | 'AUTONOMIA'
  | 'MOTORA'

export interface Meta {
  progresso: number
  id: number
  descricao: string
  status: StatusMeta
  profissional_id: number
  titulo: string
  categoria: CategoriaMeta
  prioridade: PrioridadeMeta
  crianca_id: number
  data_inicio: Date
  data_fim: Date
  created_at: Date
  updated_at: Date
}

export const PrioridadeMeta = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
} satisfies Record<PrioridadeMeta, string>

export const StatusMeta = {
  EM_ANDAMENTO: 'Em andamento',
  VENCENDO: 'Vencendo',
  QUASE_CONCLUIDA: 'Quase concluída',
  CONCLUIDA: 'Concluída',
} satisfies Record<StatusMeta, string>

export const CategoriaMeta = {
  COMUNICACAO: 'Comunicação',
  SOCIAL: 'Social',
  COGNITIVA: 'Cognitiva',
  COMPORTAMENTAL: 'Comportamental',
  AUTONOMIA: 'Autonomia',
  MOTORA: 'Motora',
} satisfies Record<CategoriaMeta, string>

export interface MetasInfo extends Meta {
  crianca: {
    id: number
    nome: string
  }
  updates: number[]
}

export interface MetaToEdit extends UpdateMetaData {
  id: number
}

export interface MetaToUpdateProgress {
  id: number
  titulo: string
  progresso: number
}
