import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { DistribuicaoData } from '../types'

interface DistribuicaoPorCategoriaProps {
  data: DistribuicaoData[]
}

export function DistribuicaoPorCategoria({ data }: DistribuicaoPorCategoriaProps) {
  return (
    <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
      <h3 className='mb-6 text-lg font-bold text-gray-900'>
        Distribuição por Categoria
      </h3>
      <div className='flex h-80 items-center justify-center'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey='value'
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout='vertical' verticalAlign='middle' align='right' />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
