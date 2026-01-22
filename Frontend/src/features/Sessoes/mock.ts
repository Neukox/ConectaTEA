import type { Sessao, SessoesSummary } from './types'

export const sessoesSummary: SessoesSummary = {
  sessoes_hoje: 12,
  sessoes_concluidas: 8,
  sessoes_esta_semana: 4,
  sessoes_pendentes: 2,
}

export const sessions: Sessao[] = [
  {
    id: 1,
    data: '2024-01-15T09:00:00Z',
    duracao: 60,
    descricao: 'Sessão focada em comunicação verbal e interação social',
    tipo: 'TERAPIA_INDIVIDUAL',
    status: 'AGENDADA',
    observacoes: null,
    crianca: {
      id: 1,
      nome: 'Ana Silva',
    },
    profissional_id: 1,
    profissional: {
      id: 1,
      nome: 'Dr. João Santos',
    },
  },
  {
    id: 2,
    data: '2024-01-15T10:30:00Z',
    duracao: 45,
    descricao: 'Exercícios de articulação e desenvolvimento da fala',
    tipo: 'FONOAUDIOLOGIA',
    status: 'CONCLUIDA',
    observacoes: 'Boa evolução na pronúncia de fonemas complexos',
    crianca: {
      id: 2,
      nome: 'Pedro Costa',
    },
    profissional_id: 2,
    profissional: {
      id: 2,
      nome: 'Dra. Ana Lima',
    },
  },
  {
    id: 3,
    data: '2024-01-15T14:00:00Z',
    duracao: 60,
    descricao: 'Atividades de coordenação motora fina',
    tipo: 'TERAPIA_OCUPACIONAL',
    status: 'EM_ANDAMENTO',
    observacoes: null,
    crianca: {
      id: 3,
      nome: 'Sofia Oliveira',
    },
    profissional_id: 3,
    profissional: {
      id: 3,
      nome: 'Dr. Roberto Silva',
    },
  },
]

export const nextSessions : Sessao[] = [
  {
    id: 1,
    data: '2024-01-15T09:30:00Z',
    duracao: 60,
    descricao: '',
    tipo: 'TERAPIA_INDIVIDUAL',
    status: 'AGENDADA',
    observacoes: null,
    crianca: {
      id: 1,
      nome: 'Ana Silva',
    },
    profissional_id: 1,
    profissional: {
      id: 1,
      nome: 'Dr. João Santos',
    },
  },
  {
    id: 2,
    data: '2024-01-15T11:00:00Z',
    duracao: 60,
    descricao: '',
    tipo: 'AVALIACAO',
    status: 'AGENDADA',
    observacoes: null,
    crianca: {
      id: 4,
      nome: 'Carlos Mendes',
    },
    profissional_id: 2,
    profissional: {
      id: 2,
      nome: 'Dra. Ana Lima',
    },
  },
]
