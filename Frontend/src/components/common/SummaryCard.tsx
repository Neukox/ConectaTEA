import { cva, type VariantProps } from 'class-variance-authority'
import type { IconType } from 'react-icons/lib'
import { cn } from '~/lib/utils'

const summaryCardVariants = cva('', {
  variants: {
    color: {
      default: 'hover:border-gray-400',
      green: 'hover:border-green-400',
      blue: 'hover:border-blue-400',
      red: 'hover:border-red-400',
      orange: 'hover:border-orange-400',
      violet: 'hover:border-violet-400',
    },
  },
  defaultVariants: {
    color: 'default',
  },
})

const summaryCardIconVariants = cva(
  'flex p-4 items-center justify-center rounded-xl border transition-all duration-200',
  {
    variants: {
      iconSize: {
        small: 'text-1.5xl',
        medium: 'text-2xl',
        large: 'text-3xl',
      },
      iconColor: {
        default:
          'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300',
        green:
          'border-green-100 bg-green-50 text-green-600 hover:border-green-300',
        blue: 'border-blue-100 bg-blue-50 text-blue-600 hover:border-blue-300',
        red: 'border-red-100 bg-red-50 text-red-600 hover:border-red-300',
        orange:
          'border-orange-100 bg-orange-50 text-orange-600 hover:border-orange-300',
        violet:
          'border-violet-100 bg-violet-50 text-violet-600 hover:border-violet-300',
      },
    },
    defaultVariants: {
      iconSize: 'medium',
      iconColor: 'default',
    },
  },
)

interface SummaryCardProps
  extends VariantProps<typeof summaryCardIconVariants>,
    VariantProps<typeof summaryCardVariants> {
  label?: string
  value: string | number
  sub?: string
  icon: IconType
}

export default function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  iconSize = 'medium',
  color = 'default',
  iconColor = 'default',
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        '@container flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent bg-white p-6 shadow transition-all duration-200 hover:-translate-y-2 hover:shadow-xl focus:-translate-y-2',
        summaryCardVariants({ color }),
      )}
    >
      <div className='@5xs:flex-row @5xs:items-center @5xs:text-start flex flex-1 flex-col items-center gap-4 text-center'>
        <div className={cn(summaryCardIconVariants({ iconSize, iconColor }))}>
          <Icon />
        </div>
        <div>
          <p className='text-2xl font-bold'>{value}</p>
          <p className='font-medium text-gray-600'>{label}</p>
          <span className='text-sm text-gray-600'>{sub}</span>
        </div>
      </div>
    </div>
  )
}
