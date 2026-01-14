import { Skeleton } from '~/components/ui/skeleton'

export function SummaryCardSkeleton() {
  return (
    <div
      className={
        '@container flex items-center gap-4 rounded-2xl border border-transparent bg-white p-6'
      }
    >
      <div className='@5xs:flex-row @5xs:items-center @5xs:text-start flex flex-1 flex-col items-center gap-4 text-center'>
        <Skeleton className='size-14' />
        <div>
          <Skeleton className='mb-2 h-8 w-12' />
          <Skeleton className='mb-1 h-4 w-24' />
        </div>
      </div>
    </div>
  )
}
