'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/button'

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
}

export function SocialButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = true,
  className = '',
  disabled,
  ...props
}: SocialButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${rounded ? 'rounded-lg' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
      text-white shadow-md hover:shadow-lg focus:ring-blue-500
      active:transform active:scale-95
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
      text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600
      focus:ring-gray-500 active:transform active:scale-95
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800
      text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200
      focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
      text-white shadow-md hover:shadow-lg focus:ring-red-500
      active:transform active:scale-95
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
      text-white shadow-md hover:shadow-lg focus:ring-green-500
      active:transform active:scale-95
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className={`animate-spin ${iconSizeClasses[size]} ${iconPosition === 'right' ? 'order-2' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </Button>
  );
}

// Icon button variant
interface SocialIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  tooltip?: string;
}

export function SocialIconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  loading = false,
  tooltip,
  className = '',
  ...props
}: SocialIconButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Button
      className={`
        inline-flex items-center justify-center rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        ${sizeClasses[size]}
        ${variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500' : ''}
        ${variant === 'secondary' ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-gray-500' : ''}
        ${variant === 'ghost' ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:ring-gray-500' : ''}
        ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' : ''}
        ${className}
      `}
      title={tooltip}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <svg
          className={`animate-spin ${iconSizeClasses[size]}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </Button>
  );
}

// Button group component
interface SocialButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md';
  className?: string;
}

export function SocialButtonGroup({
  children,
  orientation = 'horizontal',
  spacing = 'sm',
  className = ''
}: SocialButtonGroupProps) {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  };

  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4'
  };

  return (
    <div className={`flex ${orientationClasses[orientation]} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}

// Floating action button
interface SocialFABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  tooltip?: string;
}

export function SocialFAB({
  icon,
  position = 'bottom-right',
  size = 'lg',
  variant = 'primary',
  tooltip,
  className = '',
  ...props
}: SocialFABProps) {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  const sizeClasses = {
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  const iconSizeClasses = {
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  return (
    <Button
      className={`
        ${positionClasses[position]}
        ${sizeClasses[size]}
        inline-flex items-center justify-center rounded-full shadow-lg hover:shadow-xl
        transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2
        hover:scale-110 active:scale-95 z-50
        ${variant === 'primary' ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-500' : ''}
        ${variant === 'secondary' ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:ring-gray-500' : ''}
        ${className}
      `}
      title={tooltip}
      {...props}
    >
      <span className={iconSizeClasses[size]}>{icon}</span>
    </Button>
  );
}

// Toggle button
interface SocialToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function SocialToggle({
  checked,
  onChange,
  size = 'md',
  variant = 'default',
  disabled = false,
  label,
  description
}: SocialToggleProps) {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5',
    lg: 'w-12 h-6'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const translateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-6' : 'translate-x-0.5'
  };

  const variantClasses = {
    default: checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600',
    success: checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600',
    warning: checked ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600',
    danger: checked ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
      >
        <span
          className={`
            inline-block bg-white rounded-full shadow transform transition-transform duration-200
            ${thumbSizeClasses[size]}
            ${translateClasses[size]}
          `}
        />
      </Button>
      
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
