import React from 'react'
import Sidebar from '../pages/Profissional/Dashboard/Sidebar'

interface PageLayoutProps {
  children: React.ReactNode
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <main className='flex-1 overflow-x-hidden px-4 py-6 md:px-10'>
        {children}
      </main>
    </div>
  )
}

export default PageLayout
