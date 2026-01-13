import type { Meta } from './Meta.types'

export const metas: Meta[] = [
  {
    id: 1,
    titulo: 'Melhorar comunicação verbal',
    categoria: 'Comunicação',
    status: 'Em Andamento',
    prioridade: 'media',
    crianca: { nome: 'Ana Silva', avatarUrl: 'https://i.pravatar.cc/64?img=5' },
    profissional: 'Dr. João Santos',
    periodo: '31/12/2023 - 30/03/2024',
    progresso: 75,
  },
  {
    id: 2,
    titulo: 'Desenvolver habilidades sociais',
    categoria: 'Social',
    status: 'Em Andamento',
    prioridade: 'alta',
    crianca: {
      nome: 'Pedro Costa',
      avatarUrl: 'https://i.pravatar.cc/64?img=12',
    },
    profissional: 'Dra. Ana Lima',
    periodo: '14/01/2024 - 14/04/2024',
    progresso: 45,
  },
  {
    id: 3,
    titulo: 'Reduzir comportamentos repetitivos',
    categoria: 'Comportamental',
    status: 'Quase Concluída',
    prioridade: 'alta',
    crianca: {
      nome: 'Sofia Oliveira',
      avatarUrl: 'https://i.pravatar.cc/64?img=32',
    },
    profissional: 'Dr. Roberto Silva',
    periodo: '30/11/2023 - 28/02/2024',
    progresso: 90,
  },
  {
    id: 4,
    titulo: 'Aumentar tempo de atenção focada',
    categoria: 'Cognitiva',
    status: 'Em Andamento',
    prioridade: 'baixa',
    crianca: { nome: 'Ana Silva', avatarUrl: 'https://i.pravatar.cc/64?img=5' },
    profissional: 'Dr. João Santos',
    periodo: '09/01/2024 - 09/04/2024',
    progresso: 30,
  },
]
