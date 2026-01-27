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

export function UserDropdown() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

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
            <img
              src='https://randomuser.me/api/portraits/men/32.jpg'
              alt='avatar'
              className='size-8 rounded-full border-2 border-green-500'
            />
            <div className='hidden text-right md:block'>
              <p className='text-sm font-semibold text-gray-700'>
                {user?.name || 'Usuário'}
              </p>
              <p className='text-xs text-gray-500'>{user?.tipo || 'Tipo'}</p>
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
