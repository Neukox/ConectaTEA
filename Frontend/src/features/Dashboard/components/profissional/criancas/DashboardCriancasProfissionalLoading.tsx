import { Skeleton } from '~/components/ui/skeleton'

const skeletonCards = Array.from({ length: 4 })

export default function DashboardCriancasProfissionalLoading() {
  return (
    <div className='space-y-4'>
      {skeletonCards.map((_, index) => (
        <div
          key={index}
          className='flex items-center justify-between rounded-xl border border-transparent bg-gray-50 px-4 py-3 shadow-sm transition-all duration-200'
        >
          <div className='flex items-center gap-3'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-3 w-28' />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-24 rounded-full' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>
        </div>
      ))}
    </div>
  )
}
