import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EvolucaoPorCategoriaData } from '../types'
import { CategoriaMeta } from '~/features/Metas/types'
import { categoriaColors } from '../data/mockData'

interface EvolucaoPorCategoriaProps {
  data: EvolucaoPorCategoriaData[]
}

export function EvolucaoPorCategoria({ data }: EvolucaoPorCategoriaProps) {
  const formatedData = data.map((item) => ({
    ...item,
    [CategoriaMeta.SOCIAL]: item.SOCIAL,
    [CategoriaMeta.COMUNICACAO]: item.COMUNICACAO,
    [CategoriaMeta.MOTORA]: item.MOTORA,
    [CategoriaMeta.COGNITIVA]: item.COGNITIVA,
    [CategoriaMeta.COMPORTAMENTAL]: item.COMPORTAMENTAL,
    [CategoriaMeta.AUTONOMIA]: item.AUTONOMIA,
  }))

  return (
    <div className='h-100'>
      <ResponsiveContainer
        width='100%'
        height='100%'
      >
        <LineChart data={formatedData}>
          <CartesianGrid
            strokeDasharray='3 3'
            vertical={false}
          />
          <XAxis
            dataKey='periodo'
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
            dataKey={CategoriaMeta.SOCIAL}
            stroke={categoriaColors.SOCIAL}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey={CategoriaMeta.COMUNICACAO}
            stroke={categoriaColors.COMUNICACAO}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey={CategoriaMeta.MOTORA}
            stroke='#22C55E'
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey={CategoriaMeta.COGNITIVA}
            stroke={categoriaColors.COGNITIVA}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey={CategoriaMeta.COMPORTAMENTAL}
            stroke={categoriaColors.COMPORTAMENTAL}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type='monotone'
            dataKey={CategoriaMeta.AUTONOMIA}
            stroke={categoriaColors.AUTONOMIA}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
