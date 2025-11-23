import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Mock Data
const evolucaoData = [
  { name: 'Jan', social: 20, comunicacao: 30, motora: 40, cognitiva: 50 },
  { name: 'Fev', social: 25, comunicacao: 35, motora: 45, cognitiva: 55 },
  { name: 'Mar', social: 30, comunicacao: 40, motora: 50, cognitiva: 60 },
  { name: 'Abr', social: 35, comunicacao: 45, motora: 55, cognitiva: 65 },
  { name: 'Mai', social: 40, comunicacao: 50, motora: 60, cognitiva: 70 },
  { name: 'Jun', social: 45, comunicacao: 55, motora: 65, cognitiva: 75 },
]

const distribuicaoData = [
  { name: 'Social', value: 20, color: '#EC4899' },
  { name: 'Comunicação', value: 25, color: '#8B5CF6' },
  { name: 'Motora', value: 15, color: '#22C55E' },
  { name: 'Cognitiva', value: 18, color: '#06B6D4' },
  { name: 'Comportamental', value: 22, color: '#6366F1' },
]

const progressoCriancaData = [
  { name: 'Ana Silva', progresso: 78 },
  { name: 'Pedro Costa', progresso: 65 },
  { name: 'Sofia Oliveira', progresso: 85 },
  { name: 'Carlos Mendes', progresso: 72 },
]

const atualizacoesRecentes = [
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

const statsCards = [
  {
    valor: '78%',
    label: 'Progresso Médio',
    icon: (
      <svg
        className='h-8 w-8 text-green-500'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
        />
      </svg>
    ),
  },
  {
    valor: '32',
    label: 'Metas Ativas',
    icon: (
      <svg
        className='h-8 w-8 text-blue-500'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M13 10V3L4 14h7v7l9-11h-7z'
        />
      </svg>
    ),
  },
  {
    valor: '15',
    label: 'Metas Concluídas',
    icon: (
      <svg
        className='h-8 w-8 text-green-500'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
    ),
  },
  {
    valor: '24',
    label: 'Crianças Ativas',
    icon: (
      <svg
        className='h-8 w-8 text-orange-500'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
        />
      </svg>
    ),
  },
]

export default function Progresso() {
  return (
    <div className='min-h-screen space-y-6 bg-gray-50 p-6'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Progresso</h1>
          <p className='text-gray-500'>
            Acompanhe a evolução das crianças e metas
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <select className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none'>
            <option>Últimos 6 meses</option>
            <option>Último ano</option>
          </select>
          <button className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none'>
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
              />
            </svg>
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {statsCards.map((card, index) => (
          <div
            key={index}
            className='flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm'
          >
            <div className='rounded-lg bg-gray-50 p-3'>{card.icon}</div>
            <div>
              <h3 className='text-2xl font-bold text-gray-900'>{card.valor}</h3>
              <p className='text-sm text-gray-500'>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Evolução por Categoria */}
        <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
          <h3 className='mb-6 text-lg font-bold text-gray-900'>
            Evolução por Categoria
          </h3>
          <div className='h-80'>
            <ResponsiveContainer
              width='100%'
              height='100%'
            >
              <LineChart data={evolucaoData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                />
                <XAxis
                  dataKey='name'
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='social'
                  stroke='#EC4899'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='comunicacao'
                  stroke='#8B5CF6'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='motora'
                  stroke='#22C55E'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='cognitiva'
                  stroke='#06B6D4'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição por Categoria */}
        <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
          <h3 className='mb-6 text-lg font-bold text-gray-900'>
            Distribuição por Categoria
          </h3>
          <div className='flex h-80 items-center justify-center'>
            <ResponsiveContainer
              width='100%'
              height='100%'
            >
              <PieChart>
                <Pie
                  data={distribuicaoData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey='value'
                >
                  {distribuicaoData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout='vertical'
                  verticalAlign='middle'
                  align='right'
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 & Recent Updates */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Progresso por Criança */}
        <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
          <h3 className='mb-6 text-lg font-bold text-gray-900'>
            Progresso por Criança
          </h3>
          <div className='h-80'>
            <ResponsiveContainer
              width='100%'
              height='100%'
            >
              <BarChart data={progressoCriancaData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                />
                <XAxis
                  dataKey='name'
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar
                  dataKey='progresso'
                  fill='#22C55E'
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Atualizações Recentes */}
        <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
          <h3 className='mb-6 text-lg font-bold text-gray-900'>
            Atualizações Recentes
          </h3>
          <div className='space-y-4'>
            {atualizacoesRecentes.map((item, index) => (
              <div
                key={index}
                className='rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md'
              >
                <div className='mb-2 flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-gray-900'>{item.nome}</span>
                    <span className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600'>
                      {item.meta}
                    </span>
                  </div>
                  <span className='text-sm font-bold text-green-600'>
                    {item.aumento}
                  </span>
                </div>
                <p className='mb-3 text-sm text-gray-600'>{item.descricao}</p>
                <div className='flex items-center justify-between text-xs text-gray-400'>
                  <span>Profissional: {item.profissional}</span>
                  <div className='flex gap-4'>
                    <span>Data: {item.data}</span>
                    <span>Progresso atual: {item.progressoAtual}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
