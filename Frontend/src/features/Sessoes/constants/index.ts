import type { StatusSessao } from "../types";

export const TIPO_SESSAO_BADGE = {
  TERAPIA_INDIVIDUAL: 'bg-blue-300 border-blue-200 hover:bg-blue-300/80',
  TERAPIA_OCUPACIONAL: 'bg-green-300 border-green-200 hover:bg-green-300/80',
  FONOAUDIOLOGIA: 'bg-orange-300 border-orange-200 hover:bg-orange-300/80',
  AVALIACAO: 'bg-purple-300 border-purple-200 hover:bg-purple-300/80',
} satisfies Record<string, string>

export const STATUS_SESSAO_BADGE: Record<StatusSessao, string> = {
  AGENDADA: 'bg-yellow-300 border-yellow-200 hover:bg-yellow-300/80   ',
  CONCLUIDA: 'bg-green-300 border-green-200 hover:bg-green-300/80',
  EM_ANDAMENTO: 'bg-blue-300 border-blue-200 hover:bg-blue-300/80',
  PENDENTE: 'bg-amber-300 border-amber-200 hover:bg-amber-300/80',
  CANCELADA: 'bg-red-300 border-red-200 hover:bg-red-300/80',
} satisfies Record<StatusSessao, string>;