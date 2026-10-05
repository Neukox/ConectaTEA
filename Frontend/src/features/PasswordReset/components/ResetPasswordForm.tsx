import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '../../../components/ui/button'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../schemas/resetPasswordSchema'
import { PasswordField } from './PasswordField'

type ResetPasswordFormProps = {
  isSubmitting: boolean
  requestError?: string
  onSubmit(values: ResetPasswordFormData): Promise<void>
}

export function ResetPasswordForm({
  isSubmitting,
  requestError,
  onSubmit,
}: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  return (
    <form className='mt-7 space-y-5' onSubmit={handleSubmit(onSubmit)} noValidate>
      <PasswordField
        id='new-password'
        label='Nova senha'
        autoComplete='new-password'
        placeholder='Digite sua nova senha'
        disabled={isSubmitting}
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <PasswordField
        id='confirm-password'
        label='Confirmar nova senha'
        autoComplete='new-password'
        placeholder='Digite a senha novamente'
        disabled={isSubmitting}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <p
        className='min-h-5 text-sm text-red-700'
        role={requestError ? 'alert' : undefined}
        aria-live='assertive'
      >
        {requestError}
      </p>

      <Button
        type='submit'
        className='h-12 w-full bg-green-600 text-white hover:bg-green-700'
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <LoaderCircle className='animate-spin' aria-hidden='true' />
        )}
        {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
      </Button>
    </form>
  )
}
