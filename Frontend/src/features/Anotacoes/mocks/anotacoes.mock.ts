import type { Anotacao } from '../types'

export const PROFISSIONAL_ATUAL_ID = 101

export const ANOTACOES_MOCK: Anotacao[] = [
  {
    id: 1,
    criancaId: 11,
    criancaNome: 'Lucas Almeida',
    autorProfissionalId: PROFISSIONAL_ATUAL_ID,
    autorNome: 'Dra. Marina Costa',
    autorEspecialidade: 'Psicologia',
    conteudo:
      'Demonstrou boa adaptação à mudança de rotina e respondeu bem aos combinados visuais durante o encontro.',
    visibilidade: 'COMPARTILHADA',
    createdAt: '2026-10-04T14:30:00.000Z',
    updatedAt: '2026-10-04T14:30:00.000Z',
    isAutor: true,
  },
  {
    id: 2,
    criancaId: 11,
    criancaNome: 'Lucas Almeida',
    autorProfissionalId: PROFISSIONAL_ATUAL_ID,
    autorNome: 'Dra. Marina Costa',
    autorEspecialidade: 'Psicologia',
    conteudo:
      'Lembrete profissional para revisar a estratégia de antecipação na próxima sessão.',
    visibilidade: 'PRIVADA',
    createdAt: '2026-10-03T17:10:00.000Z',
    updatedAt: '2026-10-03T17:10:00.000Z',
    isAutor: true,
  },
  {
    id: 3,
    criancaId: 11,
    criancaNome: 'Lucas Almeida',
    autorProfissionalId: 202,
    autorNome: 'Dr. Rafael Lima',
    autorEspecialidade: 'Fonoaudiologia',
    conteudo:
      'A comunicação por escolhas foi incorporada com segurança. A família pode reforçar oferecendo duas alternativas por vez.',
    visibilidade: 'COMPARTILHADA',
    createdAt: '2026-10-02T11:00:00.000Z',
    updatedAt: '2026-10-02T11:00:00.000Z',
    isAutor: false,
  },
  {
    id: 4,
    criancaId: 12,
    criancaNome: 'Sofia Santos',
    autorProfissionalId: 303,
    autorNome: 'Dra. Camila Rocha',
    autorEspecialidade: 'Terapia ocupacional',
    conteudo:
      'Sofia participou do planejamento da atividade e sinalizou quando precisava de uma pausa.',
    visibilidade: 'COMPARTILHADA',
    createdAt: '2026-10-01T09:20:00.000Z',
    updatedAt: '2026-10-01T09:20:00.000Z',
    isAutor: false,
  },
  {
    id: 5,
    criancaId: 12,
    criancaNome: 'Sofia Santos',
    autorProfissionalId: PROFISSIONAL_ATUAL_ID,
    autorNome: 'Dra. Marina Costa',
    autorEspecialidade: 'Psicologia',
    conteudo:
      'Organizar materiais de apoio para observar preferências na próxima atividade estruturada.',
    visibilidade: 'PRIVADA',
    createdAt: '2026-09-30T16:45:00.000Z',
    updatedAt: '2026-09-30T16:45:00.000Z',
    isAutor: true,
  },
]
