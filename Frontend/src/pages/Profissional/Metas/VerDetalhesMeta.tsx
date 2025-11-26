import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Target,
  TrendingUp,
  User,
} from 'lucide-react'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageLayout from '~/layouts/PageLayout'
import Header from '../../../components/Header'

// Paleta (verde como identidade) - Copied from Metas.tsx
const colors = {
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
  },
}

function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const map: Record<string, string> = {
    default: `bg-white text-green-800 border border-green-200`,
    success: `bg-${'white'} text-green-800 border border-green-200`,
    warning: `bg-white text-amber-800 border border-amber-200`,
    danger: `bg-white text-red-800 border border-red-200`,
  }
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className='w-full'>
      <div className='mb-1 flex items-center justify-end text-sm font-semibold text-green-800'>
        {value}%
      </div>
      <div className='h-3 w-full rounded-full bg-gray-200'>
        <div
          className='h-3 rounded-full'
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${colors.green[400]} 0%, ${colors.green[700]} 100%)`,
          }}
        />
      </div>
    </div>
  )
}

type Meta = {
  id: number
  titulo: string
  categoria: string
  status: 'Em Andamento' | 'Quase Concluída' | 'Concluída'
  prioridade: 'alta' | 'media' | 'baixa'
  crianca: { nome: string; avatarUrl?: string }
  profissional: string
  periodo: string // "31/12/2023 - 30/03/2024"
  progresso: number
  descricao?: string // Added for details page
}

// Mock data - same as Metas.tsx but with description
const metas: Meta[] = [
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
    descricao:
      'O objetivo é aumentar o vocabulário da criança e incentivar a formação de frases completas. Serão realizadas atividades lúdicas e sessões de fonoaudiologia focadas em expressão verbal.',
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
    descricao:
      'Focar na interação com outras crianças e adultos, promovendo o compartilhamento de brinquedos e a participação em jogos em grupo.',
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
    descricao:
      'Identificar gatilhos para comportamentos repetitivos e introduzir estratégias de autorregulação e atividades alternativas.',
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
    descricao:
      'Utilizar jogos de memória e quebra-cabeças para treinar a atenção sustentada por períodos progressivamente maiores.',
  },
]

export default function VerDetalhesMeta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const meta = metas.find((m) => m.id === Number(id))

  if (!meta) {
    return (
      <PageLayout>
        <div className='flex h-full flex-col items-center justify-center'>
          <h2 className='text-xl font-bold text-gray-800'>
            Meta não encontrada
          </h2>
          <button
            onClick={() => navigate('/profissional/metas')}
            className='mt-4 text-green-600 hover:underline'
          >
            Voltar para Metas
          </button>
        </div>
      </PageLayout>
    )
  }

  let prioridadeTone: 'default' | 'success' | 'warning' | 'danger' = 'default'
  if (meta.prioridade === 'alta') prioridadeTone = 'danger'
  else if (meta.prioridade === 'media') prioridadeTone = 'warning'
  else prioridadeTone = 'default'

  return (
    <PageLayout>
      <Header
        title='Detalhes da Meta'
        description={`Visualizando detalhes da meta #${meta.id}`}
      >
        <button
          onClick={() => navigate('/profissional/metas')}
          className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
        >
          <ArrowLeft className='h-5 w-5' />
          Voltar
        </button>
      </Header>

      <div className='mx-auto mt-8 max-w-5xl px-4 pb-12'>
        {/* Card Principal */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8'>
          <div className='flex flex-col gap-6 md:flex-row md:items-start md:justify-between'>
            <div>
              <div className='flex items-center gap-3'>
                <Badge tone={prioridadeTone}>
                  Prioridade {meta.prioridade}
                </Badge>
                <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'>
                  {meta.categoria}
                </span>
                <span className='rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'>
                  {meta.status}
                </span>
              </div>
              <h1 className='mt-4 text-3xl font-bold text-gray-900'>
                {meta.titulo}
              </h1>
            </div>
            <div className='flex items-center gap-2'>
              <button className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700'>
                <TrendingUp className='h-4 w-4' />
                Atualizar Progresso
              </button>
            </div>
          </div>

          <div className='mt-8 grid grid-cols-1 gap-8 md:grid-cols-3'>
            {/* Coluna Esquerda - Info Principal */}
            <div className='col-span-2 space-y-8'>
              <section>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <FileText className='h-5 w-5 text-green-600' />
                  Descrição
                </h3>
                <p className='mt-3 leading-relaxed text-gray-600'>
                  {meta.descricao ||
                    'Nenhuma descrição fornecida para esta meta.'}
                </p>
              </section>

              <section>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <Target className='h-5 w-5 text-green-600' />
                  Progresso Atual
                </h3>
                <div className='mt-4 rounded-xl border border-gray-100 bg-gray-50 p-6'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='font-medium text-gray-700'>Conclusão</span>
                    <span className='font-bold text-green-700'>
                      {meta.progresso}%
                    </span>
                  </div>
                  <ProgressBar value={meta.progresso} />
                  <p className='mt-4 text-sm text-gray-500'>
                    Última atualização: Há 2 dias
                  </p>
                </div>
              </section>
            </div>

            {/* Coluna Direita - Detalhes Laterais */}
            <div className='space-y-6'>
              <div className='rounded-xl border border-gray-200 p-5'>
                <h4 className='mb-4 font-semibold text-gray-900'>
                  Informações
                </h4>

                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <Calendar className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Período
                      </p>
                      <p className='text-sm text-gray-600'>{meta.periodo}</p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <User className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Criança
                      </p>
                      <div className='mt-1 flex items-center gap-2'>
                        <img
                          src={meta.crianca.avatarUrl}
                          alt={meta.crianca.nome}
                          className='h-6 w-6 rounded-full'
                        />
                        <p className='text-sm text-gray-600'>
                          {meta.crianca.nome}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <CheckCircle2 className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Profissional
                      </p>
                      <p className='text-sm text-gray-600'>
                        {meta.profissional}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='rounded-xl border border-amber-100 bg-amber-50 p-5'>
                <div className='flex gap-3'>
                  <AlertTriangle className='h-5 w-5 shrink-0 text-amber-600' />
                  <div>
                    <h4 className='font-semibold text-amber-900'>Observação</h4>
                    <p className='mt-1 text-sm text-amber-800'>
                      Esta meta possui prioridade{' '}
                      <strong>{meta.prioridade}</strong>. Acompanhe de perto o
                      progresso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
