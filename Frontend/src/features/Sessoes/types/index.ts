import type { UpdateSessaoData } from '../schemas/update-sessao.schema'

export type PeriodoSessao = 'TODOS' | 'HOJE' | 'SEMANA' | 'MES'

export type TipoSessao =
  | 'TERAPIA_INDIVIDUAL'
  | 'TERAPIA_OCUPACIONAL'
  | 'FONOAUDIOLOGIA'
  | 'AVALIACAO'

export type StatusSessao =
  | 'AGENDADA'
  | 'CONCLUIDA'
  | 'EM_ANDAMENTO'
  | 'PENDENTE'
  | 'CANCELADA'

export interface SessoesSummary {
  sessoesHoje: number
  sessoesConcluidas: number
  sessoesEstaSemana: number
  sessoesPendentes: number
}

export interface SessoesFilters {
  criancaId?: number
  status?: StatusSessao
  tipo?: TipoSessao
  periodo?: PeriodoSessao
  search?: string
}

export interface Sessao {
  id: number
  descricao?: string | null
  dataHora: string
  duracao: number
  tipo: TipoSessao
  status: StatusSessao
  observacoes: string | null
  criancaId: number
}

export type SessaoToEdit = UpdateSessaoData & {
  id: number
}

export const TipoSessao = {
  TERAPIA_INDIVIDUAL: 'Terapia Individual',
  TERAPIA_OCUPACIONAL: 'Terapia Ocupacional',
  FONOAUDIOLOGIA: 'Fonoaudiologia',
  AVALIACAO: 'Avaliação',
} satisfies Record<TipoSessao, string>

export const StatusSessao = {
  AGENDADA: 'Agendada',
  CONCLUIDA: 'Concluída',
  EM_ANDAMENTO: 'Em Andamento',
  PENDENTE: 'Pendente',
  CANCELADA: 'Cancelada',
} satisfies Record<StatusSessao, string>
