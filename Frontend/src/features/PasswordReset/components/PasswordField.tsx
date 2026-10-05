import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'

import ErrorField from '../../../components/common/ErrorField'
import { Input } from '../../../components/ui/input'

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  label: string
  error?: string
}

export function PasswordField({
  id,
  label,
  error,
  ...inputProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const errorId = `${id}-error`

  return (
    <div>
      <label
        className='mb-2 block text-sm font-medium text-gray-700'
        htmlFor={id}
      >
        {label}
      </label>
      <div className='relative'>
        <Input
          {...inputProps}
          id={id}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className='h-12 rounded-lg border-gray-300 pr-12 focus-visible:ring-green-600'
        />
        <button
          type='button'
          className='absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-gray-500 transition-colors hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-600'
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
          aria-pressed={isVisible}
        >
          {isVisible ? <EyeOff aria-hidden='true' /> : <Eye aria-hidden='true' />}
        </button>
      </div>
      <ErrorField id={errorId} message={error} />
    </div>
  )
}
