import type { ProgressoStats } from '../types'

export const evolucaoData = [
  { name: 'Jan', social: 20, comunicacao: 30, motora: 40, cognitiva: 50 },
  { name: 'Fev', social: 25, comunicacao: 35, motora: 45, cognitiva: 55 },
  { name: 'Mar', social: 30, comunicacao: 40, motora: 50, cognitiva: 60 },
  { name: 'Abr', social: 35, comunicacao: 45, motora: 55, cognitiva: 65 },
  { name: 'Mai', social: 40, comunicacao: 50, motora: 60, cognitiva: 70 },
  { name: 'Jun', social: 45, comunicacao: 55, motora: 65, cognitiva: 75 },
]

export const distribuicaoData = [
  { name: 'Social', value: 20, color: '#EC4899' },
  { name: 'Comunicação', value: 25, color: '#8B5CF6' },
  { name: 'Motora', value: 15, color: '#22C55E' },
  { name: 'Cognitiva', value: 18, color: '#06B6D4' },
  { name: 'Comportamental', value: 22, color: '#6366F1' },
]

export const progressoCriancaData = [
  { name: 'Ana Silva', progresso: 78 },
  { name: 'Pedro Costa', progresso: 65 },
  { name: 'Sofia Oliveira', progresso: 85 },
  { name: 'Carlos Mendes', progresso: 72 },
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
