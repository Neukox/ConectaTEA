import { useDashboardProfissional } from '~/features/Dashboard/hooks/useDashboardProfissional'
import type { DadosDashboard } from '~/features/Dashboard/types'
import DashboardStatsProfisionalError from './stats/DashboardStatsProfisionalError'
import DashboardStatsProfisionalView from './stats/DashboardStatsProfisionalView'
import DashboardStatsProfisionalLoading from './stats/DashboardStatsProfisionalLoading'

export default function DashboardStatsProfisional() {
  const { data, isPending, isError, refetch, isFetching } =
    useDashboardProfissional()

  if (isPending) {
    return <DashboardStatsProfisionalLoading />
  }

  if (isError || !data) {
    return (
      <DashboardStatsProfisionalError
        onRetry={refetch}
        isRetrying={isFetching}
      />
    )
  }

  return <DashboardStatsProfisionalView data={data as DadosDashboard} />
}
