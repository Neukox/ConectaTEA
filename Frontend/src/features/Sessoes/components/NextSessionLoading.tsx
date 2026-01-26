import { Skeleton } from "~/components/ui/skeleton"

const NextSessionsLoading: React.FC = () => {
  return (
    <div className='space-y-4'>
      <div className='animate-pulse space-y-4'>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className='flex items-start gap-4 rounded-lg border border-gray-100 p-3'
          >
            <div className='flex flex-col items-center justify-center rounded-lg bg-gray-50 px-3 py-2 text-center'>
              <Skeleton className='h-4 w-8 rounded bg-gray-200' />
              <Skeleton className='mt-2 h-3 w-6 rounded bg-gray-200' />
            </div>
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4 rounded bg-gray-200' />
              <Skeleton className='h-3 w-1/2 rounded bg-gray-200' />
              <Skeleton className='mt-1 h-3 w-1/4 rounded bg-gray-200' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NextSessionsLoading;