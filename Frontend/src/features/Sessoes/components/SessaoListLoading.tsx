import { Skeleton } from '~/components/ui/skeleton'

export default function SessoesListLoading() {
  return (
    <div className='@container lg:col-span-2'>
      <div className='mb-6 flex flex-col items-center gap-4 rounded-xl border bg-white p-4 shadow-sm @md:flex-row @md:justify-between'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5' />
          <Skeleton className='h-6 w-48' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-10' />
          <Skeleton className='h-10 w-16' />
          <Skeleton className='h-10 w-10' />
        </div>
      </div>

      <div className='space-y-4'>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className='@container mb-4 rounded-xl border bg-white p-6 shadow-sm'
          >
            <div className='flex flex-col gap-4 @xs:flex-row @xs:items-start @xs:justify-between'>
              <div className='flex flex-1 gap-6'>
                <div className='flex flex-col items-center'>
                  <span className='text-lg font-bold text-gray-800'>
                    <Skeleton className='h-6 w-16' />
                  </span>
                  <Skeleton className='h-4 w-16' />
                </div>

                <div className='flex-1 space-y-2'>
                  <div className='flex flex-wrap items-center gap-2 mb-6'>
                    <Skeleton className='h-6 w-1/2' />
                    <Skeleton className='h-6 w-1/3' />
                    <Skeleton className='h-6 w-1/3' />
                  </div>
                  <Skeleton className='h-6 w-full' />
                  <Skeleton className='h-12 w-full' />
                  <Skeleton className='h-4 w-full' />
                </div>
              </div>

              <div className='flex justify-end gap-2 @xs:flex-col @md:flex-row'>
                <Skeleton className='h-8 w-20' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
