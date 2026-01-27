import React from 'react'
import AppSidebar from './AppSidebar'
import { SidebarProvider, SidebarInset } from '../ui/sidebar'
import AppHeader from './AppHeader'

interface PageLayoutProps {
  children: React.ReactNode
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider className='h-dvh'>
      <AppSidebar />
      <SidebarInset className='min-h-screen'>
        <AppHeader />
        <div className='h-full overflow-y-auto bg-gray-50 px-4 py-6 md:px-10'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
