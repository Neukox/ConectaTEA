import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Grid,
  Smile,
  Target,
  TrendingUp,
  Calendar,
  User,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from '~/components/ui/sidebar'
import { useIsMobile } from '~/hooks/use-mobile'
import type { IconType } from 'react-icons/lib'
import { IoCloseOutline } from 'react-icons/io5'
import { Button } from '../ui/button'

type AppSidebarNavItem = {
  title: string
  icon: LucideIcon | IconType
  path: string
}

const AppSidebar: React.FC = () => {
  const location = useLocation()

  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()

  const menuItems: AppSidebarNavItem[] = [
    {
      title: 'Visão Geral',
      icon: Grid,
      path: '/profissional/dashboard',
    },
    {
      title: 'Crianças',
      icon: Smile,
      path: '/profissional/criancas',
    },
    {
      title: 'Metas',
      icon: Target,
      path: '/profissional/metas',
    },
    {
      title: 'Progresso',
      icon: TrendingUp,
      path: '/profissional/progresso',
    },
    {
      title: 'Sessões',
      icon: Calendar,
      path: '/profissional/sessoes',
    },
  ]

  const accountItems = [
    {
      title: 'Perfil',
      icon: User,
      path: '/profissional/perfil',
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/profissional/configuracoes',
    },
  ]

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <Sidebar
      collapsible={isMobile ? 'offcanvas' : 'none'}
      variant='sidebar'
      className='border-sidebar-border border-r'
    >
      {/* Logo e título */}
      <SidebarHeader className='h-14.25 flex-row items-center justify-between border-b px-4 py-2'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white'>
            C
          </div>
          <span className='text-sidebar-foreground font-semibold'>
            ConectaTEA
          </span>
        </div>
        <Button
          asChild
          variant='ghost'
          size='icon'
          onClick={() => setOpenMobile(false)}
          className='p-1 md:hidden'
        >
          <IoCloseOutline className='size-4' />
        </Button>
      </SidebarHeader>

      <SidebarContent className='min-w-52 flex-1 py-2'>
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                    className='font-medium [&>svg]:size-5'
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Menu de Conta */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                    className='font-medium [&>svg]:size-5'
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Botão sair */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip='Sair'
              className='text-red-500 hover:bg-red-100 hover:text-red-600'
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
