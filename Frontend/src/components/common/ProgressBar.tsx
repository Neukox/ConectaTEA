import { cva } from 'class-variance-authority'
import { Progress } from '~/components/ui/progress'
import { cn } from '~/lib/utils'

interface ProgressBarProps {
  value: number
  variant?: 'green' | 'blue' | 'red' | 'gray'
  className?: string
  children?: React.ReactNode
}

const progressBarVariants = cva('h-3 rounded-full [&>div]:rounded-full', {
  variants: {
    variant: {
      green: '[&>div]:bg-linear-90 [&>div]:from-green-400 [&>div]:to-green-700',
      blue: '[&>div]:bg-linear-90 [&>div]:from-blue-400 [&>div]:to-blue-700',
      red: '[&>div]:bg-linear-90 [&>div]:from-red-400 [&>div]:to-red-700',
      gray: '[&>div]:bg-linear-90 [&>div]:from-gray-400 [&>div]:to-gray-700',
    },
  },
  defaultVariants: {
    variant: 'green',
  },
})

export function ProgressBar({
  value,
  variant = 'green',
  className,
  children,
}: ProgressBarProps) {
  return (
    <div className='w-full'>
      {children}
      <Progress
        value={value}
        className={cn(progressBarVariants({ variant }), className)}
      />
    </div>
  )
}
