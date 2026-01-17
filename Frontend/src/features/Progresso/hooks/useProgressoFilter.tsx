import { useContext } from 'react'
import { ProgressoFilterContext } from '../context/provider'

export default function useProgressoFilter() {
  const context = useContext(ProgressoFilterContext)

  if (context === undefined) {
    throw new Error(
      'useProgressoFilter must be used within a ProgressoFilterProvider',
    )
  }

  return context
}
