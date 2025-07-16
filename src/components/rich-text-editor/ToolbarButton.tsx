'use client'

import { ReactNode } from 'react'

interface ToolbarButtonProps {
  onClick: () => void
  title?: string
  children: ReactNode
  isActive?: boolean
  disabled?: boolean
}

export function ToolbarButton({ 
  onClick, 
  title, 
  children, 
  isActive = false, 
  disabled = false 
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`
        p-2 rounded hover:bg-gray-200 transition-colors duration-150 
        flex items-center justify-center min-w-[32px] min-h-[32px]
        ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      `}
    >
      {children}
    </button>
  )
}
