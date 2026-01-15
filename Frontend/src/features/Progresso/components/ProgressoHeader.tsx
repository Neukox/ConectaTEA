import { LucideDownload } from 'lucide-react'
import Header from '~/components/layout/Header'

interface ProgressoHeaderProps {
  onExport?: () => void
  onPeriodChange?: (period: string) => void
}

export function ProgressoHeader({ onExport, onPeriodChange }: ProgressoHeaderProps) {
  return (
    <Header
      title='Progresso'
      description='Acompanhe a evolução das crianças e metas'
    >
      <div className='flex items-center gap-3'>
        <select
          className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none'
          onChange={(e) => onPeriodChange?.(e.target.value)}
        >
          <option value='6months'>Últimos 6 meses</option>
          <option value='1year'>Último ano</option>
        </select>
        <button
          onClick={onExport}
          className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:outline-none'
        >
          <LucideDownload />
          Exportar Relatório
        </button>
      </div>
    </Header>
  )
}
