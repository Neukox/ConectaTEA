import type {
  DadosCriancasDashboard,
  DadosDashboard,
  DadosMetasDashboard,
} from '../types'

export async function getDadosDashboardProfissional(): Promise<DadosDashboard> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate fetched data
  const dados: DadosDashboard = {
    totalCriancas: 25,
    criancasEsteMes: 5,
    profissionaisAtivos: 10,
    profissionaisAtivosEsteMes: 2,
    totalMetas: 40,
    totalMetasEsteMes: 8,
    taxaProgresso: 75,
    taxaProgressoEsteMes: 80,
  }

  return Promise.resolve(dados)
}

export async function getCriancasDashboardProfissional(): Promise<
  DadosCriancasDashboard[]
> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate fetched data
  const criancas: DadosCriancasDashboard[] = [
    {
      criancaId: 1,
      nome: 'João Silva',
      idade: 8,
      status: 'VINCULADO',
      diagnostico: 'Transtorno do Espectro Autista',
      profissional: 'Psicólogo Ana Martins',
    },
    {
      criancaId: 2,
      nome: 'Maria Oliveira',
      idade: 7,
      status: 'VINCULADO',
      diagnostico: 'Déficit de Atenção e Hiperatividade',
      profissional: 'Terapeuta Ocupacional Carlos Souza',
    },
    {
      criancaId: 3,
      nome: 'Lucas Santos',
      idade: 9,
      status: 'VINCULADO',
      diagnostico: 'Transtorno do Espectro Autista',
      profissional: 'Fonoaudiólogo Mariana Lima',
    },
    {
      criancaId: 4,
      nome: 'Ana Costa',
      idade: 6,
      status: 'SUSPENSO',
      diagnostico: 'Transtorno de Ansiedade',
      profissional: 'Psicopedagogo Rafael Gomes',
    },
  ]

  return Promise.resolve(criancas)
}

export async function getMetasDashboardProfissional(): Promise<
  DadosMetasDashboard[]
> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate fetched data
  const metas: DadosMetasDashboard[] = [
    {
      id: 1,
      titulo: 'Melhorar Comunicação Verbal',
      status: 'EM_ANDAMENTO',
      progresso: 60,
      crianca: 'Ana Silva',
    },
    {
      id: 2,
      titulo: 'Aprimorar comunicação verbal',
      status: 'EM_ANDAMENTO',
      progresso: 100,
      crianca: 'João Pedro',
    },
    {
      id: 3,
      titulo: 'Desenvolver coordenação motora',
      status: 'QUASE_CONCLUIDA',
      progresso: 45,
      crianca: 'Lucas Santos',
    },
    {
      id: 4,
      titulo: 'Reduzir comportamentos ansiosos',
      status: 'EM_ANDAMENTO',
      progresso: 0,
      crianca: 'Ana Costa',
    },
  ]

  return Promise.resolve(metas)
}
