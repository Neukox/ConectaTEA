import { Skeleton } from '~/components/ui/skeleton'

export function DistribuicaoPorCategoriaLoading() {
  return (
    <div className='flex h-100 items-center justify-center gap-8'>
      {/* Skeleton do gráfico de pizza */}
      <div className='relative flex items-center justify-center'>
        <Skeleton className='h-52 w-52 rounded-full' />
        <Skeleton className='absolute h-32 w-32 rounded-full bg-white' />
      </div>

      {/* Skeleton da legenda */}
      <div className='flex flex-col gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='flex items-center gap-2'
          >
            <Skeleton className='h-4 w-4 rounded-sm' />
            <Skeleton className='h-4 w-24' />
          </div>
        ))}
      </div>
    </div>
  )
}
