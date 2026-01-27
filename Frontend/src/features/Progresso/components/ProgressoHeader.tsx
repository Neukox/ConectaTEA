import { LucideDownload } from 'lucide-react'
import Header from '~/components/layout/Header'
import useProgressoFilter from '../hooks/useProgressoFilter'
import type { ProgressoFilters } from '../types'

export function ProgressoHeader() {
  const { setProgressoFilter } = useProgressoFilter()

  const onPeriodChange = (period: string) => {
    setProgressoFilter({ periodo: period as ProgressoFilters['periodo'] })
  }

  return (
    <Header
      title='Progresso'
      description='Acompanhe a evolução das crianças e metas'
      className='@container flex-col justify-between gap-4 lg:flex-row'
    >
      <div className='flex items-center gap-x-4 gap-y-3 flex-wrap'>
        <select
          className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none'
          onChange={(e) => onPeriodChange(e.target.value)}
        >
          <option value='SEMESTRAL'>Últimos 6 meses</option>
          <option value='ANUAL'>Último ano</option>
        </select>
        <button className='flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none @3xl:flex-initial'>
          <LucideDownload />
          Exportar Relatório
        </button>
      </div>
    </Header>
  )
}
