import { Skeleton } from '~/components/ui/skeleton'

const skeletonCards = Array.from({ length: 4 })

export default function DashboardStatsProfisionalLoading() {
  return (
    <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {skeletonCards.map((_, index) => (
        <div
          key={index}
          className='flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent bg-white p-6 shadow transition-all duration-200 hover:-translate-y-2 hover:border-green-400 hover:bg-white hover:shadow-xl focus:-translate-y-2'
        >
          <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-green-100 bg-green-50 transition-all duration-200 hover:border-green-400 hover:bg-green-100'>
            <Skeleton className='h-6 w-6 rounded-full' />
          </div>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-7 w-28' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-3 w-20' />
          </div>
        </div>
      ))}
    </div>
  )
}
