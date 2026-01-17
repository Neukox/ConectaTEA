import { createContext, useState } from 'react'
import type { ProgressoFilterContextType } from './types'
import type { ProgressoFilters } from '../types'

export const ProgressoFilterContext = createContext<
  ProgressoFilterContextType | undefined
>(undefined)

export function ProgressoFilterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [progressoFilter, setProgressoFilter] = useState<ProgressoFilters>({
    periodo: 'SEMESTRAL',
  })

  return (
    <ProgressoFilterContext.Provider
      value={{ progressoFilter, setProgressoFilter }}
    >
      {children}
    </ProgressoFilterContext.Provider>
  )
}
