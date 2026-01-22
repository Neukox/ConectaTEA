import { cn } from '~/lib/utils'

type ErrorFieldProps = {
  message: string | undefined
} & React.HTMLAttributes<HTMLSpanElement>

export default function ErrorField({
  message,
  className,
  ...props
}: ErrorFieldProps) {
  return (
    <span
      className={cn('mt-1 text-sm text-red-600', className)}
      aria-live='polite'
      aria-atomic='true'
      {...props}
    >
      {message}
    </span>
  )
}
