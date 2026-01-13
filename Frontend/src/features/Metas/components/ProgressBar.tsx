import { colors } from '../../colors'

interface ProgressBarProps {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className='w-full'>
      <div className='mb-1 flex items-center justify-end text-sm font-semibold text-green-800'>
        {value}%
      </div>
      <div className='h-3 w-full rounded-full bg-gray-200'>
        <div
          className='h-3 rounded-full'
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${colors.green[400]} 0%, ${colors.green[700]} 100%)`,
          }}
        />
      </div>
    </div>
  )
}
