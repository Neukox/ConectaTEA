import { useState, useCallback } from 'react'
import type { SessoesFilters } from '../types'

export default function useSessoesFilters() {
  const [filters, setFilters] = useState<SessoesFilters>({
    periodo: 'HOJE',
  })

  const aplicarFiltros = useCallback((novosFiltros: SessoesFilters) => {
    setFilters((prev) => ({ ...prev, ...novosFiltros }))
  }, [])

  const limparFiltros = useCallback(() => {
    setFilters({
      periodo: 'HOJE',
      search: filters.search,
    })
  }, [filters.search])

  return {
    filters,
    aplicarFiltros,
    limparFiltros,
  }
}
