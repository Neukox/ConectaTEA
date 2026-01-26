import { Periodo } from '~/api/types'
import type { UpdateSessaoData } from '../schemas/update-sessao.schema'

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
  sessoes_hoje: number
  sessoes_concluidas: number
  sessoes_esta_semana: number
  sessoes_pendentes: number
}

export interface SessoesFilters {
  criancaId?: number
  status?: StatusSessao
  tipo?: TipoSessao
  periodo?: Periodo
  search?: string
}

export interface Sessao {
  id: number
  descricao: string
  data: string
  duracao: number
  tipo: TipoSessao
  status: StatusSessao
  observacoes: string | null
  crianca: {
    id: number
    nome: string
  }
  profissional_id: number
  profissional: {
    id: number
    nome: string
  }
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
