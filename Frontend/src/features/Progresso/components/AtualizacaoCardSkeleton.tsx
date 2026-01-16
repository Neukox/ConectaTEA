import { Skeleton } from '~/components/ui/skeleton'

export function AtualizacaoCardSkeleton() {
  return (
    <div className='rounded-lg border border-gray-100 p-4'>
      <div className='mb-2 flex items-start justify-between'>
        <div className='flex items-center gap-2 w-full'>
          <Skeleton className='h-5 w-1/3' />
          <Skeleton className='h-6 w-1/2 rounded' />
        </div>
        <Skeleton className='h-5 w-12' />
      </div>
      <Skeleton className='mb-3 h-4 w-full' />
      <div className='flex items-center justify-between gap-4'>
        <Skeleton className='h-3 w-1/2' />
        <div className='flex gap-4 w-1/2 justify-end'>
          <Skeleton className='h-3 w-1/2' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      </div>
    </div>
  )
}
