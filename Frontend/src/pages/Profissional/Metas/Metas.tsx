import React from 'react'
import ReactDOM from 'react-dom'
import {
  TrendingUp,
  Filter,
  Eye,
  Pencil,
  Target,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import Header from '../../../components/Header'

// Paleta (verde como identidade)
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

// Componente para os cards de resumo do topo
function SummaryCard({
  icon: Icon,
  label,
  value,
  tooltip,
}: {
  icon: React.ElementType
  label: string
  value: number
  tooltip: string
}) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = React.useState<{
    left: number
    top: number
  }>({ left: 0, top: 0 })

  React.useEffect(() => {
    if (showTooltip && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setTooltipPos({
        left: rect.left + rect.width / 2,
        top: rect.top - 12, // 12px acima do card
      })
    }
  }, [showTooltip])

  return (
    <>
      <div
        ref={cardRef}
        className='group relative flex min-h-[110px] cursor-pointer items-center gap-4 rounded-2xl border border-transparent bg-white p-6 shadow transition-all duration-200 hover:-translate-y-2 hover:border-green-400 hover:bg-white hover:shadow-xl focus:-translate-y-2'
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
      >
        <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-green-100 bg-green-50 transition-all duration-200 group-hover:border-green-400 group-hover:bg-green-100'>
          <Icon className='h-7 w-7 text-green-600' />
        </div>
        <div>
          <p className='text-2xl font-bold'>{value}</p>
          <p className='font-medium text-gray-600'>{label}</p>
        </div>
      </div>
      {showTooltip &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              left: tooltipPos.left,
              top: tooltipPos.top,
              transform: 'translate(-50%, -100%)',
            }}
            className='pointer-events-none z-50 flex flex-col items-center'
          >
            <div className='animate-fade-in-up rounded-lg bg-gray-900 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg'>
              {tooltip}
            </div>
            <div className='mt-1 h-3 w-3 rotate-45 bg-gray-900'></div>
          </div>,
          document.body,
        )}
    </>
  )
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

function OutlineButton({
  icon: Icon,
  children,
}: {
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <button className='inline-flex items-center gap-2 rounded-md border border-green-300 px-3 py-2 text-sm font-medium text-green-800 transition-colors hover:bg-green-50 active:bg-green-100'>
      {Icon ? <Icon className='h-4 w-4' /> : null}
      <span>{children}</span>
    </button>
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
}

// Componente para cada meta
function MetaCard({ meta }: { meta: Meta }) {
  let prioridadeTone: 'default' | 'success' | 'warning' | 'danger' = 'default'
  if (meta.prioridade === 'alta') prioridadeTone = 'danger'
  else if (meta.prioridade === 'media') prioridadeTone = 'warning'
  else prioridadeTone = 'default'

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-4'>
          <img
            src={meta.crianca.avatarUrl}
            alt={meta.crianca.nome}
            className='h-12 w-12 rounded-full border'
          />
          <div>
            <div className='text-lg font-semibold text-green-800'>
              {meta.titulo}
            </div>
            <div className='text-xs text-gray-500'>
              {meta.categoria} • {meta.status}
            </div>
            <div className='mt-1 flex items-center gap-2'>
              <span className='text-xs text-gray-400'>
                Período: {meta.periodo}
              </span>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2 md:justify-end'>
          <OutlineButton icon={Eye}>Ver Detalhes</OutlineButton>
          <OutlineButton icon={TrendingUp}>Atualizar Progresso</OutlineButton>
          <OutlineButton icon={Pencil}>Editar</OutlineButton>
        </div>
      </div>
      <div className='mt-6'>
        <div className='mb-2 text-sm font-semibold text-gray-700'>
          Progresso
        </div>
        <ProgressBar value={meta.progresso} />
      </div>
      <div className='mt-4 flex flex-wrap items-center gap-2'>
        <button className='rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-50'>
          +5%
        </button>
        <button className='rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-50'>
          +10%
        </button>
        <Badge tone={prioridadeTone}>Prioridade {meta.prioridade}</Badge>
      </div>
    </div>
  )
}

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

export default function MetasPage() {
  return (
    <div className='h-full bg-[#f8f9fb]'>
      <Header
        title='Metas'
        description='Gerencie as metas terapêuticas das crianças'
        showSearch={false}
      >
        <button className='flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700'>
          <span className='text-lg'>+</span>
          Nova Meta
        </button>
      </Header>

      {/* Toolbar topo */}
      <div className='mt-6'>
        <div className='px-4 md:px-8'>
          <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <SummaryCard
              icon={Target}
              label='Total de Metas'
              value={47}
              tooltip='Quantidade total de metas cadastradas.'
            />
            <SummaryCard
              icon={TrendingUp}
              label='Em Andamento'
              value={32}
              tooltip='Metas que estão em andamento no momento.'
            />
            <SummaryCard
              icon={AlertTriangle}
              label='Vencendo'
              value={8}
              tooltip='Metas próximas do prazo de vencimento.'
            />
            <SummaryCard
              icon={CheckCircle2}
              label='Concluídas'
              value={15}
              tooltip='Metas já concluídas.'
            />
          </div>
        </div>
      </div>

      {/* Busca + Filtro */}
      <div className='mx-auto max-w-7xl px-4'>
        <div className='mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:px-8'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='relative w-full md:max-w-xl'>
              <input
                type='text'
                placeholder='Buscar metas por nome da criança ou título...'
                className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100'
              />
            </div>
            <button className='inline-flex items-center gap-2 rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50'>
              <Filter className='h-4 w-4' />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Metas */}
      <div className='mt-6 space-y-5 px-4 md:px-8'>
        {metas.map((m) => (
          <MetaCard
            key={m.id}
            meta={m}
          />
        ))}
      </div>
    </div>
  )
}
