type TipoSessao =
  | 'TERAPIA_INDIVIDUAL'
  | 'TERAPIA_OCUPACIONAL'
  | 'FONOAUDIOLOGIA'
  | 'AVALIACAO'

type StatusSessao =
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
