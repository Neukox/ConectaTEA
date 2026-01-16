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
    <div className='min-h-80 flex-1'>
      <ResponsiveContainer
        width='100%'
        height='100%'
      >
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray='3 3'
            vertical={false}
          />
          <XAxis
            dataKey='nome'
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
  )
}
