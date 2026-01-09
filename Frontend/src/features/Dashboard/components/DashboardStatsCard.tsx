import type { IconType } from 'react-icons/lib'

interface DashboardStatsCardProps {
  card: {
    label: string
    valor: string | number
    sub: string
  }
  icon: IconType
}

export default function DashboardStatsCard({
  card,
  icon: Icon,
}: DashboardStatsCardProps) {
  return (
    <div className='flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent bg-white p-6 shadow transition-all duration-200 hover:-translate-y-2 hover:border-green-400 hover:bg-white hover:shadow-xl focus:-translate-y-2'>
      <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-green-100 bg-green-50 transition-all duration-200 hover:border-green-400 hover:bg-green-100'>
        <Icon className='size-6 text-green-600' />
      </div>
      <div>
        <p className='text-2xl font-bold'>{card.valor}</p>
        <p className='font-medium text-gray-600'>{card.label}</p>
        <span className='text-sm font-semibold text-green-600'>{card.sub}</span>
      </div>
    </div>
  )
}
