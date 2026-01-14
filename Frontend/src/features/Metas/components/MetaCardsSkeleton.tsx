import { Skeleton } from '~/components/ui/skeleton'

const metasCards = Array.from({ length: 4 })

export default function MetaCardsSkeleton() {
  return (
    <>
      {metasCards.map((_, index) => (
        <div
          key={index}
          className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
        >
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-center gap-4'>
              {/* Avatar skeleton */}
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='flex flex-col gap-2'>
                {/* Título skeleton */}
                <Skeleton className='h-6 w-48 rounded' />
                {/* Categoria/Status skeleton */}
                <Skeleton className='h-4 w-32 rounded' />
                {/* Período skeleton */}
                <Skeleton className='mt-1 h-3 w-40 rounded' />
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-2 md:justify-end'>
              {/* Botões skeleton */}
              <Skeleton className='h-9 w-32 rounded-lg' />
              <Skeleton className='h-9 w-40 rounded-lg' />
              <Skeleton className='h-9 w-24 rounded-lg' />
            </div>
          </div>
          <div className='mt-6'>
            {/* Progresso label skeleton */}
            <Skeleton className='mb-2 h-4 w-20 rounded' />
            {/* Barra de progresso skeleton */}
            <Skeleton className='h-3 w-full rounded-full' />
          </div>
          <div className='mt-4 flex flex-wrap items-center gap-2'>
            {/* Badges skeleton */}
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-6 w-24 rounded-full' />
          </div>
        </div>
      ))}
    </>
  )
}
