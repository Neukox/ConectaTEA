import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import SummaryCard from '~/components/common/SummaryCard'
import type { IconType } from 'react-icons/lib'

interface SummaryCardMetaProps {
  icon: IconType
  label: string
  value: number
  tooltip: string
}

export function SummaryCardMeta({
  icon: Icon,
  label,
  value,
  tooltip,
}: SummaryCardMetaProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SummaryCard
          label={label}
          value={value}
          icon={Icon}
          iconColor='green'
          color='green'
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
