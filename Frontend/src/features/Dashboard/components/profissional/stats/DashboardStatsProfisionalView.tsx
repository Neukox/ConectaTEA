import { TooltipProvider } from '~/components/ui/tooltip'
import type { DadosDashboard } from '../../../types'
import DashboardStatsTooltip, {
  type DashboardStatsTooltipProps,
} from '../../DashboardStatsTooltip'
import { FaBullseye, FaChild } from 'react-icons/fa'
import { FaUserDoctor } from 'react-icons/fa6'
import { IoMdTrendingUp } from 'react-icons/io'

interface DashboardStatsViewProps {
  data: DadosDashboard
}

export default function DashboardStatsProfisionalView({
  data,
}: DashboardStatsViewProps) {
  const dataToView: DashboardStatsTooltipProps[] = [
    {
      card: {
        label: 'Total de Crianças',
        valor: data.totalCriancas,
        sub:
          data.criancasEsteMes > 0
            ? `+${data.criancasEsteMes} este mês`
            : '0 este mês',
      },
      hint: 'Quantidade total de crianças cadastradas na plataforma.',
      icon: FaChild,
    },
    {
      card: {
        label: 'Profissionais Ativos',
        valor: data.profissionaisAtivos,
        sub:
          data.profissionaisAtivos > 0
            ? `+${data.profissionaisAtivos} este mês`
            : '0 este mês',
      },
      hint: 'Número de profissionais ativos na plataforma.',
      icon: FaUserDoctor,
    },
    {
      card: {
        label: 'Metas Ativas',
        valor: data.totalMetas,
        sub:
          data.totalMetasEsteMes > 0
            ? `+${data.totalMetasEsteMes} esta semana`
            : '0 esta semana',
      },
      hint: 'Total de metas em andamento para as crianças.',
      icon: FaBullseye,
    },
    {
      card: {
        label: 'Taxa de Progresso',
        valor: `${Math.round(data.taxaProgresso)}%`,
        sub:
          data.taxaProgressoEsteMes > 0
            ? `+${Math.round(data.taxaProgressoEsteMes)}% este mês`
            : '0% este mês',
      },
      hint: 'Porcentagem média de progresso nas metas.',
      icon: IoMdTrendingUp,
    },
  ]

  return (
    <TooltipProvider>
      <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {dataToView.map((data, i) => (
          <DashboardStatsTooltip
            key={i}
            card={data.card}
            hint={data.hint}
            icon={data.icon}
          />
        ))}
      </div>
    </TooltipProvider>
  )
}
