import type { CategoriaMeta } from '~/features/Metas/types'
import type {
  DistribuicaoPorCategoriaData,
  EvolucaoPorCategoriaData,
  ProgressoCriancaData,
  ProgressoStats,
} from '../types'

// Mock de dados para evolução por categoria (formato retornado pelo backend)
// Período: Últimos 6 meses (Ago/25 a Jan/26)
export const evolucaoData: EvolucaoPorCategoriaData[] = [
  {
    periodo: 'Ago/25',
    COMUNICACAO: 42,
    SOCIAL: 38,
    COGNITIVA: 55,
    COMPORTAMENTAL: 48,
    AUTONOMIA: 45,
    MOTORA: 50,
  },
  {
    periodo: 'Set/25',
    COMUNICACAO: 48,
    SOCIAL: 45,
    COGNITIVA: 58,
    COMPORTAMENTAL: 52,
    AUTONOMIA: 50,
    MOTORA: 55,
  },
  {
    periodo: 'Out/25',
    COMUNICACAO: 52,
    SOCIAL: 50,
    COGNITIVA: 62,
    COMPORTAMENTAL: 56,
    AUTONOMIA: 55,
    MOTORA: 58,
  },
  {
    periodo: 'Nov/25',
    COMUNICACAO: 58,
    SOCIAL: 55,
    COGNITIVA: 65,
    COMPORTAMENTAL: 60,
    AUTONOMIA: 60,
    MOTORA: 62,
  },
  {
    periodo: 'Dez/25',
    COMUNICACAO: 62,
    SOCIAL: 60,
    COGNITIVA: 70,
    COMPORTAMENTAL: 65,
    AUTONOMIA: 65,
    MOTORA: 68,
  },
  {
    periodo: 'Jan/26',
    COMUNICACAO: 68,
    SOCIAL: 65,
    COGNITIVA: 73,
    COMPORTAMENTAL: 70,
    AUTONOMIA: 70,
    MOTORA: 72,
  },
]

// Mock de dados para distribuição por categoria
export const distribuicaoData: DistribuicaoPorCategoriaData = {
  COMUNICACAO: 25,
  SOCIAL: 20,
  COGNITIVA: 30,
  COMPORTAMENTAL: 15,
  AUTONOMIA: 5,
  MOTORA: 5,
}

export const progressoCriancaData: ProgressoCriancaData[] = [
  { nome: 'Ana Silva', progresso: 78 },
  { nome: 'Pedro Costa', progresso: 65 },
  { nome: 'Sofia Oliveira', progresso: 85 },
  { nome: 'Carlos Mendes', progresso: 72 },
]

export const atualizacoesRecentes = [
  {
    nome: 'Ana Silva',
    meta: 'Melhorar comunicação verbal',
    aumento: '+10%',
    descricao:
      'Demonstrou melhora significativa na formação de frases completas',
    profissional: 'Dr. João Santos',
    data: '11/01/2024',
    progressoAtual: 75,
  },
  {
    nome: 'Pedro Costa',
    meta: 'Desenvolver habilidades sociais',
    aumento: '+5%',
    descricao: 'Maior participação em atividades em grupo',
    profissional: 'Dra. Ana Lima',
    data: '10/01/2024',
    progressoAtual: 45,
  },
  {
    nome: 'Sofia Oliveira',
    meta: 'Reduzir comportamentos repetitivos',
    aumento: '+5%',
    descricao: 'Redução notável de estereotipias durante as sessões',
    profissional: 'Dr. Roberto Silva',
    data: '09/01/2024',
    progressoAtual: 90,
  },
]

export const statsCards: ProgressoStats = {
  media_progresso: 78,
  metas_ativas: 32,
  metas_concluidas: 15,
  criancas_ativas: 24,
}

export const categoriaColors = {
  SOCIAL: '#EC4899',
  COMUNICACAO: '#8B5CF6',
  COGNITIVA: '#06B6D4',
  COMPORTAMENTAL: '#FBBF24',
  AUTONOMIA: '#F59E0B',
  MOTORA: '#22C55E',
} satisfies Record<CategoriaMeta, string>
