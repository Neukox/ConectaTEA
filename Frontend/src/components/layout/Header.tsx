import React from 'react'
import { cn } from '~/lib/utils'

interface HeaderProps {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('mb-8 flex border-b pb-4', className)}>
      <div>
        {title && <h1 className='text-2xl font-bold text-gray-800'>{title}</h1>}
        {description && <p className='text-gray-500'>{description}</p>}
      </div>

      {children}
    </div>
  )
}

export default Header
