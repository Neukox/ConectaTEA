import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

export function Badge({ children, tone = 'default' }: BadgeProps) {
  const map: Record<string, string> = {
    default: `bg-white text-green-800 border border-green-200`,
    success: `bg-${'white'} text-green-800 border border-green-200`,
    warning: `bg-white text-amber-800 border border-amber-200`,
    danger: `bg-white text-red-800 border border-red-200`,
  }
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  )
}
