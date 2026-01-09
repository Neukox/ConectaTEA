import { api } from '~/api/httpClient'
import type {
  DadosCriancasDashboard,
  DadosDashboard,
  DadosMetasDashboard,
} from '../types'

export async function getDadosDashboardProfissional(): Promise<DadosDashboard> {
  const response = await api.get<DadosDashboard>('/dashboard/profissional')
  return response.data
}

export async function getCriancasDashboardProfissional(): Promise<
  DadosCriancasDashboard[]
> {
  const response = await api.get<DadosCriancasDashboard[]>(
    '/dashboard/profissional/criancas',
  )
  return response.data
}

export async function getMetasDashboardProfissional(): Promise<
  DadosMetasDashboard[]
> {
  const response = await api.get<DadosMetasDashboard[]>(
    '/dashboard/profissional/metas',
  )
  return response.data
}
