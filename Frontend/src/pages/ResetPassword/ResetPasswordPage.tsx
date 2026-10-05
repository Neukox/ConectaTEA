import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { ROUTES } from '../../config/routes'
import { ResetPasswordForm } from '../../features/PasswordReset/components/ResetPasswordForm'
import { PasswordResetStatus } from '../../features/PasswordReset/components/PasswordResetStatus'
import type { ResetPasswordFormData } from '../../features/PasswordReset/schemas/resetPasswordSchema'
import {
  PasswordResetError,
  passwordResetService,
  type PasswordResetGateway,
} from '../../features/PasswordReset/services/passwordResetService'

type PageStatus = 'form' | 'success' | 'invalid-link'

type ResetPasswordPageProps = {
  service?: PasswordResetGateway
}

const CONNECTION_ERROR =
  'Não foi possível redefinir sua senha agora. Tente novamente em alguns instantes.'

export default function ResetPasswordPage({
  service = passwordResetService,
}: ResetPasswordPageProps) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [status, setStatus] = useState<PageStatus>(token ? 'form' : 'invalid-link')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string>()

  const handleSubmit = async ({ newPassword }: ResetPasswordFormData) => {
    if (isSubmitting || !token) return

    setIsSubmitting(true)
    setRequestError(undefined)

    try {
      await service.resetPassword({ token, newPassword })
      setStatus('success')
    } catch (error: unknown) {
      if (error instanceof PasswordResetError && error.kind === 'invalid-token') {
        setStatus('invalid-link')
        return
      }
      setRequestError(CONNECTION_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='relative flex min-h-screen w-full max-w-full items-center justify-center overflow-x-hidden bg-gray-50 px-4 py-12'>
      <div
        className='pointer-events-none absolute inset-0 opacity-70'
        aria-hidden='true'
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(34,197,94,0.13), transparent 34%), radial-gradient(circle at 85% 80%, rgba(16,185,129,0.10), transparent 30%)',
        }}
      />

      <div className='relative w-full max-w-md'>
        <header className='mb-7 text-center'>
          <Link
            to={ROUTES.HOME}
            className='inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-4'
            aria-label='Ir para a página inicial do ConectaTEA'
          >
            <img src='/conectatea.svg' alt='' className='size-12' />
            <span className='text-2xl font-bold tracking-tight text-gray-900'>
              ConectaTEA
            </span>
          </Link>
        </header>

        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-green-950/5 sm:p-8'>
          {status === 'form' ? (
            <>
              <div className='text-center'>
                <h1 className='w-full text-2xl font-bold tracking-tight text-gray-900'>
                  Redefinir sua senha
                </h1>
                <p className='mt-2 text-sm leading-6 text-gray-600'>
                  Escolha uma nova senha para acessar sua conta.
                </p>
              </div>
              <ResetPasswordForm
                isSubmitting={isSubmitting}
                requestError={requestError}
                onSubmit={handleSubmit}
              />
              <Link
                to={ROUTES.LOGIN}
                className='mt-6 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium text-green-700 transition-colors hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600'
              >
                <ArrowLeft aria-hidden='true' className='size-4' />
                Voltar para o login
              </Link>
            </>
          ) : (
            <PasswordResetStatus status={status} />
          )}
        </div>

        <p className='mt-6 text-center text-sm text-gray-500'>
          Sua jornada de apoio começa aqui.
        </p>
      </div>
    </main>
  )
}
