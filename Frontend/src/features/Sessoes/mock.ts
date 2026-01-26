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
    data: '15/01/2024, 09:00:00',
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
    data: '15/01/2024, 10:30:00',
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
    data: '15/01/2024, 14:00:00',
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

export const nextSessions: Sessao[] = [
  {
    id: 4,
    data: '16/01/2024, 09:30:00',
    duracao: 60,
    descricao: 'Sessão focada em habilidades sociais',
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
    id: 5,
    data: '17/01/2024, 11:00:00',
    duracao: 60,
    descricao: 'Avaliação inicial para diagnóstico',
    tipo: 'AVALIACAO',
    status: 'AGENDADA',
    observacoes: 'Levar relatórios escolares e médicos',
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
