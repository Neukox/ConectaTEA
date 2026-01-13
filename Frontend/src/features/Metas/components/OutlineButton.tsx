import React from 'react'

interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType
  children: React.ReactNode
}

export function OutlineButton({ icon: Icon, children, ...props }: OutlineButtonProps) {
  return (
    <button
      className='inline-flex items-center gap-2 rounded-md border border-green-300 px-3 py-2 text-sm font-medium text-green-800 transition-colors hover:bg-green-50 active:bg-green-100'
      {...props}
    >
      {Icon ? <Icon className='h-4 w-4' /> : null}
      <span>{children}</span>
    </button>
  )
}
