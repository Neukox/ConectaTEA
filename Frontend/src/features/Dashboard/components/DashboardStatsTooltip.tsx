import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import DashboardStatsCard from './DashboardStatsCard'
import type { IconType } from 'react-icons/lib'

export interface DashboardStatsTooltipProps {
  card: {
    label: string
    valor: string | number
    sub: string
  }
  hint: string
  icon: IconType
}

export default function DashboardStatsTooltip({
  card,
  hint,
  icon,
}: DashboardStatsTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DashboardStatsCard
          card={card}
          icon={icon}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{hint}</p>
      </TooltipContent>
    </Tooltip>
  )
}
