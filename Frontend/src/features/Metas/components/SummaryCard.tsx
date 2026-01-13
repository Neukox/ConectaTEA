import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'

interface SummaryCardProps {
  icon: React.ElementType
  label: string
  value: number
  tooltip: string
}

export function SummaryCard({ icon: Icon, label, value, tooltip }: SummaryCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className='flex min-h-[110px] cursor-pointer items-center gap-4 rounded-2xl border border-transparent bg-white p-6 shadow transition-all duration-200 hover:-translate-y-2 hover:border-green-400 hover:bg-white hover:shadow-xl focus:-translate-y-2'>
          <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-green-100 bg-green-50 transition-all duration-200 hover:border-green-400 hover:bg-green-100'>
            <Icon className='h-7 w-7 text-green-600' />
          </div>
          <div>
            <p className='text-2xl font-bold'>{value}</p>
            <p className='font-medium text-gray-600'>{label}</p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
