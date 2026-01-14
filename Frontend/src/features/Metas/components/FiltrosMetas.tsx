import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import type { MetasFilters } from '../types'
import { CategoriaMeta, PrioridadeMeta, StatusMeta } from '../types'
import { Periodo } from '~/api/types'

interface FiltrosMetasPopoverProps {
  filtros: MetasFilters
  onAplicarFiltros: (filtros: MetasFilters) => void
  children: React.ReactNode
}

export function FiltrosMetas({
  filtros,
  onAplicarFiltros,
  children,
}: FiltrosMetasPopoverProps) {
  const [open, setOpen] = useState(false)
  const [filtrosLocais, setFiltrosLocais] = useState<MetasFilters>(filtros)

  const handleAplicar = () => {
    onAplicarFiltros(filtrosLocais)
    setOpen(false)
  }

  const handleLimpar = () => {
    setFiltrosLocais({})
    onAplicarFiltros({})
    setOpen(false)
  }

  const handleChange = (field: keyof MetasFilters, value: string) => {
    setFiltrosLocais((prev) => {
      const newFiltros = { ...prev }
      if (value) {
        newFiltros[field] = value
      } else {
        delete newFiltros[field]
      }
      return newFiltros
    })
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className='w-80 bg-white p-0'
        align='end'
      >
        <div className='space-y-4 p-4'>
          <div className='space-y-2'>
            <h3 className='text-sm font-semibold text-gray-900'>
              Filtrar Metas
            </h3>
          </div>

          {/* Categoria */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-gray-700'>
              Categoria
            </label>
            <select
              value={filtrosLocais.categoria || ''}
              onChange={(e) => handleChange('categoria', e.target.value)}
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none'
            >
              <option value=''>Todas</option>
              {Object.entries(CategoriaMeta).map(([key, label]) => (
                <option
                  key={key}
                  value={key}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridade */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-gray-700'>
              Prioridade
            </label>
            <select
              value={filtrosLocais.prioridade || ''}
              onChange={(e) => handleChange('prioridade', e.target.value)}
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none'
            >
              <option value=''>Todas</option>
              {Object.entries(PrioridadeMeta).map(([key, label]) => (
                <option
                  key={key}
                  value={key}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-gray-700'>Status</label>
            <select
              value={filtrosLocais.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none'
            >
              <option value=''>Todos</option>
              {Object.entries(StatusMeta).map(([key, label]) => (
                <option
                  key={key}
                  value={key}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Período */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-gray-700'>Período</label>
            <select
              value={filtrosLocais.periodo || ''}
              onChange={(e) => handleChange('periodo', e.target.value)}
              className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none'
            >
              <option value=''>Todos</option>
              {Object.entries(Periodo).map(([key, label]) => (
                <option
                  key={key}
                  value={key}
                >
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Botões de ação */}
          <div className='flex gap-2 border-t border-gray-200 pt-4'>
            <Button
              variant='outline'
              onClick={handleLimpar}
              className='flex-1 border-gray-300 text-xs text-gray-700 hover:bg-gray-50'
              size='sm'
            >
              Limpar
            </Button>
            <Button
              onClick={handleAplicar}
              className='flex-1 bg-green-600 text-xs text-white hover:bg-green-700'
              size='sm'
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
