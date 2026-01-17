import type { ProgressoFilters } from "../types"

export type ProgressoFilterContextType = {
  progressoFilter: ProgressoFilters
  setProgressoFilter: (filter: ProgressoFilters) => void
}
