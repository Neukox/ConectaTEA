import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  icon: LucideIcon
  count: number
  label: string
  color: string
  iconColor: string
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon: Icon,
  count,
  label,
  color,
  iconColor,
}) => {
  return (
    <div className='flex items-center rounded-xl border bg-white p-6 shadow-sm'>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className='ml-4'>
        <h3 className='text-2xl font-bold text-gray-800'>{count}</h3>
        <p className='text-sm text-gray-500'>{label}</p>
      </div>
    </div>
  )
}

export default SummaryCard
