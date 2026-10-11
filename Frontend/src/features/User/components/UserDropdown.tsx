import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '~/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui'
import { logout } from '~/api/authApi'

export function UserDropdown() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      setUser(null)
      navigate('/login', { replace: true })
    }
  }

  const roleLabel =
    user?.tipo === 'PROFISSIONAL'
      ? 'Profissional'
      : user?.tipo === 'RESPONSAVEL'
        ? 'Responsável'
        : 'Tipo'
  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          asChild
          variant='ghost'
          size='sm'
          className='focus:outline-none p-1'
        >
          <div className='flex items-center gap-2'>
            {user?.fotoPerfilUrl ? (
              <img
                src={user.fotoPerfilUrl}
                alt={`Foto de ${user.name}`}
                className='size-8 rounded-full border-2 border-primary object-cover'
              />
            ) : (
              <span
                aria-hidden='true'
                className='flex size-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xs font-bold text-primary'
              >
                {initials}
              </span>
            )}
            <div className='hidden text-right md:block'>
              <p className='text-sm font-semibold text-gray-700'>
                {user?.name || 'Usuário'}
              </p>
              <p className='text-xs text-gray-500'>{roleLabel}</p>
            </div>
            <ChevronDown className='h-4 w-4 text-gray-500' />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-48'
      >
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user?.tipo === 'PROFISSIONAL' && (
          <>
            <DropdownMenuItem
              onClick={() => navigate('/profissional/perfil')}
              className='cursor-pointer'
            >
              <User className='mr-2 h-4 w-4' />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/profissional/configuracoes')}
              className='cursor-pointer'
            >
              <Settings className='mr-2 h-4 w-4' />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={handleLogout}
          className='cursor-pointer text-red-600 focus:text-red-600'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
