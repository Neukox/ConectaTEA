import { Skeleton } from '~/components/ui/skeleton'

const skeletonCards = Array.from({ length: 4 })

export default function DashboardMetasProfissionalLoading() {
  return (
    <div className='space-y-4'>
      {skeletonCards.map((_, index) => (
        <div
          key={index}
          className='rounded-xl border border-transparent bg-gray-50 px-4 py-3 shadow-sm'
        >
          <div className='mb-3 flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-3 w-32' />
            </div>
            <div className='flex flex-col items-end gap-2'>
              <Skeleton className='h-6 w-24 rounded-full' />
              <Skeleton className='h-5 w-10' />
            </div>
          </div>
          <Skeleton className='h-3 w-full rounded-full' />
        </div>
      ))}
    </div>
  )
}
