import { useMemo } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { DistribuicaoPorCategoriaData } from '../types'
import { CategoriaMeta } from '~/features/Metas/types'
import { categoriaColors } from '../constants'

interface DistribuicaoPorCategoriaProps {
  data: DistribuicaoPorCategoriaData
}

export function DistribuicaoPorCategoria({
  data,
}: DistribuicaoPorCategoriaProps) {
  const mappedData = useMemo(() => {
    const entries = Object.entries(data) as [CategoriaMeta, number][]

    return entries.map(([key, value]) => ({
      name: CategoriaMeta[key],
      value: value,
      color: categoriaColors[key],
    }))
  }, [data])

  return (
    <div className='flex h-100 items-center justify-center'>
      <ResponsiveContainer
        width='100%'
        height='100%'
      >
        <PieChart>
          <Pie
            data={mappedData}
            cx='50%'
            cy='50%'
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey='value'
          >
            {mappedData.map((entry, index) => (
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
  )
}
