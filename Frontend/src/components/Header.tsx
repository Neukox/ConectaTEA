import React from 'react'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  title?: string
  description?: string
  children?: React.ReactNode
  showSearch?: boolean
  showNotifications?: boolean
  showProfile?: boolean
  searchValue?: string
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  children,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  searchValue,
  onSearchChange,
}) => {
  const [userName, setUserName] = React.useState('Profissional')
  const [userRole, setUserRole] = React.useState('PROFISSIONAL')

  React.useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserName(user.name || user.nome || 'Profissional')
        // If role is available in user object, set it. Otherwise default.
        if (user.role) setUserRole(user.role.toUpperCase())
      } catch (e) {
        console.error('Error parsing user from localStorage', e)
      }
    }
  }, [])

  return (
    <div className='mb-8 flex flex-col border-b pb-4 md:flex-row md:items-center md:justify-between'>
      <div>
        {title && <h1 className='text-2xl font-bold text-gray-800'>{title}</h1>}
        {description && <p className='text-gray-500'>{description}</p>}
      </div>

      <div className='mt-4 flex items-center gap-4 md:mt-0'>
        {/* Children (Custom Actions) */}
        {children}

        {/* Global Search */}
        {showSearch && (
          <div className='relative hidden md:block'>
            <input
              type='text'
              placeholder='Buscar...'
              value={searchValue}
              onChange={onSearchChange}
              className='rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-10 focus:ring-2 focus:ring-green-200 focus:outline-none'
            />
            <Search className='absolute top-2.5 left-3 h-5 w-5 text-gray-400' />
          </div>
        )}

        {/* Notifications */}
        {showNotifications && (
          <button className='relative rounded-full p-2 hover:bg-gray-100'>
            <Bell className='h-6 w-6 text-gray-500' />
            <span className='absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500'></span>
          </button>
        )}

        {/* Profile Dropdown */}
        {showProfile && (
          <div className='group/profile relative flex items-center gap-2'>
            <button className='flex items-center gap-2 focus:outline-none'>
              <img
                src='https://randomuser.me/api/portraits/men/32.jpg'
                alt='avatar'
                className='h-10 w-10 rounded-full border-2 border-green-500'
              />
              <div className='hidden text-right md:block'>
                <p className='text-sm font-semibold text-gray-700'>
                  {userName}
                </p>
                <p className='text-xs text-gray-500'>{userRole}</p>
              </div>
              <ChevronDown className='h-4 w-4 text-gray-500' />
            </button>

            {/* Dropdown Menu */}
            <div className='invisible absolute top-full right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white py-1 opacity-0 shadow-lg transition-all duration-200 group-hover/profile:visible group-hover/profile:opacity-100'>
              <Link
                to='/profissional/perfil'
                className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
              >
                Meu Perfil
              </Link>
              <Link
                to='/profissional/configuracoes'
                className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
              >
                Configurações
              </Link>
              <div className='my-1 h-px bg-gray-100'></div>
              <button
                onClick={() => {
                  localStorage.clear()
                  window.location.href = '/login'
                }}
                className='block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50'
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
