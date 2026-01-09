import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../../components/layout/Header'
import { PageLayout } from '~/components/layout/PageLayout'
import { CadastrarCriancaDialog } from '~/features/CadastrarCrianca'
import { CadastrarMetaDialog } from '~/features/Metas'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { FaPlus } from 'react-icons/fa'
import { HiPlus } from 'react-icons/hi'

const criancas = [
  {
    id: 1,
    nome: 'Ana Silva',
    idade: '6 anos',
    nivel: 'TEA Leve',
    profissional: 'Dr. Maria Santos',
    status: 'Ativo',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 2,
    nome: 'João Pedro',
    idade: '8 anos',
    nivel: 'TEA Moderado',
    profissional: 'Dr. Carlos Lima',
    status: 'Ativo',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
  },
  {
    id: 3,
    nome: 'Sofia Costa',
    idade: '5 anos',
    nivel: 'TEA Leve',
    profissional: 'Dra. Ana Oliveira',
    status: 'Ativo',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id: 4,
    nome: 'Lucas Ferreira',
    idade: '7 anos',
    nivel: 'TEA Severo',
    profissional: 'Dr. Pedro Rocha',
    status: 'Pausado',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
]

const metas = [
  {
    id: 1,
    nome: 'Ana Silva',
    meta: 'Melhorar comunicação verbal',
    progresso: 85,
    status: 'Em andamento',
  },
  {
    id: 2,
    nome: 'João Pedro',
    meta: 'Desenvolver habilidades sociais',
    progresso: 60,
    status: 'Em andamento',
  },
  {
    id: 3,
    nome: 'Sofia Costa',
    meta: 'Reduzir comportamentos repetitivos',
    progresso: 92,
    status: 'Quase concluída',
  },
  {
    id: 4,
    nome: 'Lucas Ferreira',
    meta: 'Aumentar tempo de atenção',
    progresso: 45,
    status: 'Em andamento',
  },
]

const cardIcons = [
  // Ícone 1: Pessoas (Total de Crianças)
  <svg
    width='48'
    height='48'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    className='text-green-500'
  >
    <rect
      x='3'
      y='3'
      width='18'
      height='18'
      rx='6'
      stroke='#22C55E'
      strokeWidth='2'
      fill='#F0FDF4'
    />
    <path
      d='M8.5 10.5C8.5 11.6046 9.39543 12.5 10.5 12.5C11.6046 12.5 12.5 11.6046 12.5 10.5C12.5 9.39543 11.6046 8.5 10.5 8.5C9.39543 8.5 8.5 9.39543 8.5 10.5Z'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
    <path
      d='M15.5 10.5C15.5 11.6046 16.3954 12.5 17.5 12.5C18.6046 12.5 19.5 11.6046 19.5 10.5C19.5 9.39543 18.6046 8.5 17.5 8.5C16.3954 8.5 15.5 9.39543 15.5 10.5Z'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
    <path
      d='M7 16C7 14.3431 8.34315 13 10 13H11C12.6569 13 14 14.3431 14 16'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
    <path
      d='M14 16C14 14.3431 15.3431 13 17 13H18C19.6569 13 21 14.3431 21 16'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
  </svg>,
  // Ícone 2: Profissional (Profissionais Ativos)
  <svg
    width='48'
    height='48'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    className='text-green-500'
  >
    <rect
      x='3'
      y='3'
      width='18'
      height='18'
      rx='6'
      stroke='#22C55E'
      strokeWidth='2'
      fill='#F0FDF4'
    />
    <path
      d='M12 10.5C12 11.6046 12.8954 12.5 14 12.5C15.1046 12.5 16 11.6046 16 10.5C16 9.39543 15.1046 8.5 14 8.5C12.8954 8.5 12 9.39543 12 10.5Z'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
    <path
      d='M7 16C7 14.3431 8.34315 13 10 13H11C12.6569 13 14 14.3431 14 16'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
    <path
      d='M14 16C14 14.3431 15.3431 13 17 13H18C19.6569 13 21 14.3431 21 16'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
  </svg>,
  // Ícone 3: Alvo (Metas Ativas)
  <svg
    width='48'
    height='48'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    className='text-green-500'
  >
    <rect
      x='3'
      y='3'
      width='18'
      height='18'
      rx='6'
      stroke='#22C55E'
      strokeWidth='2'
      fill='#F0FDF4'
    />
    <circle
      cx='12'
      cy='12'
      r='5'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
    <circle
      cx='12'
      cy='12'
      r='2'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
  </svg>,
  // Ícone 4: Gráfico (Taxa de Progresso)
  <svg
    width='48'
    height='48'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    className='text-green-500'
  >
    <rect
      x='3'
      y='3'
      width='18'
      height='18'
      rx='6'
      stroke='#22C55E'
      strokeWidth='2'
      fill='#F0FDF4'
    />
    <path
      d='M8 16L12 12L16 16'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
    <path
      d='M12 12V8'
      stroke='#22C55E'
      strokeWidth='1.5'
    />
  </svg>,
]

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false)
  const [showMetaModal, setShowMetaModal] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <PageLayout>
        <Header
          title='Dashboard'
          description='Acompanhe o progresso e gerencie as atividades'
        />

        {/* Cards superiores */}
        <TooltipProvider>
          <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {[
              {
                valor: 24,
                label: 'Total de Crianças',
                sub: '+2 este mês',
                tooltip:
                  'Quantidade total de crianças cadastradas na plataforma.',
              },
              {
                valor: 8,
                label: 'Profissionais Ativos',
                sub: '+1 este mês',
                tooltip: 'Número de profissionais ativos atualmente.',
              },
              {
                valor: 47,
                label: 'Metas Ativas',
                sub: '+5 esta semana',
                tooltip: 'Total de metas em andamento para as crianças.',
              },
              {
                valor: '78%',
                label: 'Taxa de Progresso',
                sub: '+12% este mês',
                tooltip: 'Porcentagem média de progresso das metas.',
              },
            ].map((card, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className='flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent bg-white p-6 shadow transition-all duration-200 hover:-translate-y-2 hover:border-green-400 hover:bg-white hover:shadow-xl focus:-translate-y-2'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-green-100 bg-green-50 transition-all duration-200 hover:border-green-400 hover:bg-green-100'>
                      {cardIcons[i]}
                    </div>
                    <div>
                      <p className='text-2xl font-bold'>{card.valor}</p>
                      <p className='font-medium text-gray-600'>{card.label}</p>
                      <span className='text-sm font-semibold text-green-600'>
                        {card.sub}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{card.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* Conteúdo principal */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Crianças Recentes */}
          <div className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-bold'>Crianças Recentes</h2>
              <button
                onClick={() => setShowModal(true)}
                className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700'
              >
                <HiPlus className='size-4' />
                Adicionar
              </button>
            </div>
            <div className='space-y-3'>
              {criancas.map((crianca, index) => (
                <div
                  key={index}
                  className='flex cursor-pointer items-center justify-between rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-all duration-200 hover:-translate-y-1 hover:border-green-400 hover:bg-white hover:shadow-md focus:-translate-y-1'
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/profissional/criancas/detalhes/${crianca.id}`)
                  }
                >
                  <div className='flex items-center gap-3'>
                    <img
                      src={crianca.avatar}
                      alt={crianca.nome}
                      className='h-12 w-12 rounded-full border-2 border-white object-cover shadow'
                    />
                    <div>
                      <p className='text-base font-semibold'>{crianca.nome}</p>
                      <p className='text-xs text-gray-500'>
                        {crianca.idade} · {crianca.nivel}
                      </p>
                      <p className='text-xs text-gray-400'>
                        Profissional: {crianca.profissional}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        crianca.status === 'Ativo'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {crianca.status}
                    </span>
                    <button className='rounded p-1 hover:bg-gray-200'>
                      <svg
                        className='h-5 w-5 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          cx='12'
                          cy='12'
                          r='1'
                        />
                        <circle
                          cx='19'
                          cy='12'
                          r='1'
                        />
                        <circle
                          cx='5'
                          cy='12'
                          r='1'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metas em Andamento */}
          <div className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-bold'>Metas em Andamento</h2>
              <button
                onClick={() => setShowMetaModal(true)}
                className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700'
              >
                <HiPlus className='size-4' />
                Nova Meta
              </button>
            </div>
            <div className='space-y-4'>
              {metas.map((meta, index) => (
                <div
                  key={index}
                  className='cursor-pointer rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-all duration-200 hover:-translate-y-1 hover:border-green-400 hover:bg-white hover:shadow-md focus:-translate-y-1'
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/profissional/metas/detalhes/${meta.id}`)
                  }
                >
                  <div className='mb-1 flex items-center justify-between'>
                    <div>
                      <p className='text-base font-semibold'>{meta.nome}</p>
                      <p className='text-xs text-gray-500'>{meta.meta}</p>
                    </div>
                    <div className='text-right'>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          meta.status === 'Quase concluída'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {meta.status}
                      </span>
                      <p className='text-base font-bold text-green-600'>
                        {meta.progresso}%
                      </p>
                    </div>
                  </div>
                  <div className='h-3 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-3 rounded-full bg-green-500 transition-all duration-500'
                      style={{ width: `${meta.progresso}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
      <CadastrarCriancaDialog
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={() => setShowModal(false)}
      />
      <CadastrarMetaDialog
        open={showMetaModal}
        onOpenChange={setShowMetaModal}
      />
    </>
  )
}
