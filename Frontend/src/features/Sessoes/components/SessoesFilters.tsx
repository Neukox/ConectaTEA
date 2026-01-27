import { Search, Filter } from 'lucide-react'
import { Periodo } from '~/api/types'
import useDebounce from '~/hooks/useDebounce'
import { StatusSessao, TipoSessao } from '../types'
import type { SessoesFilters } from '../types'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from '@radix-ui/react-popover'

// Mock data for children
const criancas = [
  { id: '1', name: 'Ana Silva' },
  { id: '2', name: 'Pedro Costa' },
  { id: '3', name: 'Sofia Oliveira' },
]

export interface SessoesFiltersProps {
  filters: SessoesFilters
  onAplicarFiltros: (novosFiltros: SessoesFilters) => void
  onLimparFiltros: () => void
}

export function SessoesFilters({
  filters,
  onAplicarFiltros,
  onLimparFiltros,
}: SessoesFiltersProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [openPopover, setOpenPopover] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    onAplicarFiltros({ ...filters, search: debouncedSearch })
  }, [debouncedSearch, onAplicarFiltros])

  const handleLimpar = () => {
    onLimparFiltros()
    setOpenPopover(false)
  }

  return (
    <div className='@container'>
      <div className='flex flex-col gap-4 @md:flex-row'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Buscar sessões...'
            className='w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 focus:border-green-500 focus:outline-none'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className='flex gap-2'>
          <select
            className='flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 focus:border-green-500 focus:outline-none'
            onChange={(e) =>
              onAplicarFiltros({ periodo: e.target.value as Periodo })
            }
            value={filters.periodo}
          >
            <option value='HOJE'>{Periodo.HOJE}</option>
            <option value='SEMANAL'>{Periodo.SEMANAL}</option>
            <option value='MENSAL'>{Periodo.MENSAL}</option>
          </select>
        </div>
        <div>
          <Popover
            open={openPopover}
            onOpenChange={setOpenPopover}
          >
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='flex flex-1 items-center gap-2 p-5 font-normal'
              >
                <Filter className='size-5' />
                Filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='w-80 bg-white p-0'
              align='end'
            >
              <div className='space-y-4 p-4'>
                {/* Categoria */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-gray-700'>
                    Criança
                  </label>
                  <select
                    value={filters.criancaId || ''}
                    onChange={(e) =>
                      onAplicarFiltros({ criancaId: Number(e.target.value) })
                    }
                    className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none'
                  >
                    <option value=''>Todas</option>
                    {criancas.map((child) => (
                      <option
                        key={child.id}
                        value={child.id}
                      >
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo*/}
                <div className='space-y-1.5'>
                  <label className='text-xs font-medium text-gray-700'>
                    Status
                  </label>
                  <select
                    value={filters.tipo || ''}
                    onChange={(e) =>
                      onAplicarFiltros({ tipo: e.target.value as TipoSessao })
                    }
                    className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none'
                  >
                    <option value=''>Todas</option>
                    {Object.entries(TipoSessao).map(([key, label]) => (
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
                  <label className='text-xs font-medium text-gray-700'>
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) =>
                      onAplicarFiltros({
                        status: e.target.value as StatusSessao,
                      })
                    }
                    className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none'
                  >
                    <option value=''>Todos</option>
                    {Object.entries(StatusSessao).map(([key, label]) => (
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
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
