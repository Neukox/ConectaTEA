// src/components/Sidebar.tsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Grid,
  Smile,
  Users,
  Target,
  TrendingUp,
  Calendar,
  MessageCircle,
  Cpu,
  User,
  Settings,
} from 'lucide-react'
const Sidebar: React.FC = () => {
  const location = useLocation()

  return (
    <aside className='sticky top-0 hidden h-screen w-64 flex-col border-r bg-white md:flex'>
      {/* Logo e título */}
      <div className='flex items-center gap-2 border-b px-6 py-4'>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white'>
          C
        </div>
        <span className='font-semibold text-gray-700'>ConectaTEA</span>
      </div>

      {/* Menu lateral */}
      <nav className='flex-1 space-y-2 px-4 py-6'>
        <Link
          to='/profissional/dashboard'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.pathname === '/profissional/dashboard'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Grid className='h-5 w-5' />
          <span>Dashboard</span>
        </Link>

        <Link
          to='/profissional/criancas'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.pathname === '/profissional/criancas'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Smile className='h-5 w-5' />
          <span>Crianças</span>
        </Link>

        <Link
          to='/profissional/profissionais'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.pathname === '/profissional/profissionais'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className='h-5 w-5' />
          <span>Profissionais</span>
        </Link>

        <Link
          to='/profissional/metas'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.pathname === '/profissional/metas'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Target className='h-5 w-5' />
          <span>Metas</span>
        </Link>

        <Link
          to='/profissional/progresso'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.hash === '#progresso'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className='h-5 w-5' />
          <span>Progresso</span>
        </Link>

        <Link
          to='/profissional/sessoes'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.pathname === '/profissional/sessoes'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className='h-5 w-5' />
          <span>Sessões</span>
        </Link>

        <Link
          to='#chat'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.hash === '#chat'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageCircle className='h-5 w-5' />
          <span>Chat</span>
        </Link>

        <Link
          to='#ia'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.hash === '#ia'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Cpu className='h-5 w-5' />
          <span>IA</span>
        </Link>

        <Link
          to='/profissional/perfil'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.pathname === '/profissional/perfil'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className='h-5 w-5' />
          <span>Perfil</span>
        </Link>

        <Link
          to='/profissional/configuracoes'
          className={`flex items-center gap-3 rounded-lg px-4 py-2 font-medium ${
            location.pathname === '/profissional/configuracoes'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className='h-5 w-5' />
          <span>Configurações</span>
        </Link>
      </nav>

      {/* Botão sair */}
      <div className='border-t px-4 py-4'>
        <button
          className='w-full text-left font-medium text-red-500'
          onClick={() => {
            localStorage.clear()
            window.location.href = '/login'
          }}
        >
          Sair
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
