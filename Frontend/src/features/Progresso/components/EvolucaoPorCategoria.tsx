import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EvolucaoData } from '../types'

interface EvolucaoPorCategoriaProps {
  data: EvolucaoData[]
}

export function EvolucaoPorCategoria({ data }: EvolucaoPorCategoriaProps) {
  return (
    <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
      <h3 className='mb-6 text-lg font-bold text-gray-900'>
        Evolução por Categoria
      </h3>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} />
            <XAxis dataKey='name' axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
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
  )
}
