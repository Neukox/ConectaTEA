import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProgressoCriancaData } from '../types'

interface ProgressoPorCriancaProps {
  data: ProgressoCriancaData[]
}

export function ProgressoPorCrianca({ data }: ProgressoPorCriancaProps) {
  return (
    <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
      <h3 className='mb-6 text-lg font-bold text-gray-900'>
        Progresso por Criança
      </h3>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis dataKey='name' axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
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
  )
}
