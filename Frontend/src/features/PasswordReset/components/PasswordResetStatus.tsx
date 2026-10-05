import { CheckCircle2, Link2Off } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../../components/ui/button'
import { ROUTES } from '../../../config/routes'

type PasswordResetStatusProps = {
  status: 'success' | 'invalid-link'
}

const CONTENT = {
  success: {
    title: 'Senha redefinida com sucesso',
    description: 'Agora você pode entrar novamente usando sua nova senha.',
    action: 'Ir para o login',
    Icon: CheckCircle2,
    iconClasses: 'bg-green-100 text-green-700',
  },
  'invalid-link': {
    title: 'Link inválido ou expirado',
    description:
      'Este link não pode mais ser utilizado. Solicite uma nova recuperação de senha.',
    action: 'Voltar para o login',
    Icon: Link2Off,
    iconClasses: 'bg-amber-100 text-amber-700',
  },
} as const

export function PasswordResetStatus({ status }: PasswordResetStatusProps) {
  const navigate = useNavigate()
  const { title, description, action, Icon, iconClasses } = CONTENT[status]

  return (
    <section className='text-center' aria-live='polite' aria-atomic='true'>
      <div
        className={`mx-auto mb-5 flex size-14 items-center justify-center rounded-full ${iconClasses}`}
      >
        <Icon className='size-7' aria-hidden='true' />
      </div>
      <h1 className='text-2xl font-bold tracking-tight text-gray-900'>{title}</h1>
      <p className='mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600'>
        {description}
      </p>
      <Button
        type='button'
        className='mt-7 h-12 w-full bg-green-600 text-white hover:bg-green-700'
        onClick={() => navigate(ROUTES.LOGIN)}
      >
        {action}
      </Button>
    </section>
  )
}
