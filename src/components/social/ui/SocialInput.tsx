'use client';

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { Button } from '@/components/button'

// Base input component
interface SocialInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
}

export const SocialInput = forwardRef<HTMLInputElement, SocialInputProps>(({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  variant = 'outlined',
  inputSize = 'md',
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const variantClasses = {
    default: `
      border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
      focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20
    `,
    filled: `
      border-0 bg-gray-100 dark:bg-gray-700
      focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20
    `,
    outlined: `
      border-2 border-gray-200 dark:border-gray-600 bg-transparent
      focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0
    `
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 ${iconSizeClasses[inputSize]}`}>
              {icon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full rounded-lg transition-all duration-200 placeholder-gray-400
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeClasses[inputSize]}
            ${variantClasses[variant]}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 ${iconSizeClasses[inputSize]}`}>
              {icon}
            </span>
          </div>
        )}
      </div>
      
      {(error || hint) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          ) : hint ? (
            <p className="text-gray-500 dark:text-gray-400">{hint}</p>
          ) : null}
        </div>
      )}
    </div>
  );
});

SocialInput.displayName = 'SocialInput';

// Textarea component
interface SocialTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  autoResize?: boolean;
}

export const SocialTextarea = forwardRef<HTMLTextAreaElement, SocialTextareaProps>(({
  label,
  error,
  hint,
  variant = 'outlined',
  inputSize = 'md',
  autoResize = false,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const variantClasses = {
    default: `
      border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
      focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20
    `,
    filled: `
      border-0 bg-gray-100 dark:bg-gray-700
      focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20
    `,
    outlined: `
      border-2 border-gray-200 dark:border-gray-600 bg-transparent
      focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0
    `
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={`
          w-full rounded-lg transition-all duration-200 placeholder-gray-400
          disabled:opacity-50 disabled:cursor-not-allowed resize-none
          ${sizeClasses[inputSize]}
          ${variantClasses[variant]}
          ${error ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20' : ''}
          ${autoResize ? 'resize-y' : ''}
          ${className}
        `}
        {...props}
      />
      
      {(error || hint) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          ) : hint ? (
            <p className="text-gray-500 dark:text-gray-400">{hint}</p>
          ) : null}
        </div>
      )}
    </div>
  );
});

SocialTextarea.displayName = 'SocialTextarea';

// Search input component
interface SocialSearchProps extends Omit<SocialInputProps, 'icon' | 'iconPosition'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export function SocialSearch({
  onClear,
  showClearButton = true,
  value,
  ...props
}: SocialSearchProps) {
  const searchIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const clearIcon = (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className="relative">
      <SocialInput
        icon={searchIcon}
        iconPosition="left"
        value={value}
        {...props}
      />
      
      {showClearButton && value && onClear && (
        <Button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <span className="w-4 h-4">{clearIcon}</span>
        </Button>
      )}
    </div>
  );
}

// Select component
interface SocialSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function SocialSelect({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  variant = 'outlined',
  inputSize = 'md',
  disabled = false,
  className = ''
}: SocialSelectProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const variantClasses = {
    default: `
      border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
      focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20
    `,
    filled: `
      border-0 bg-gray-100 dark:bg-gray-700
      focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20
    `,
    outlined: `
      border-2 border-gray-200 dark:border-gray-600 bg-transparent
      focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0
    `
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`
          w-full rounded-lg transition-all duration-200 appearance-none cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[inputSize]}
          ${variantClasses[variant]}
          ${error ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20' : ''}
          ${className}
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {(error || hint) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          ) : hint ? (
            <p className="text-gray-500 dark:text-gray-400">{hint}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// File input component
interface SocialFileInputProps {
  label?: string;
  error?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  onChange?: (files: FileList | null) => void;
  disabled?: boolean;
  className?: string;
  dragAndDrop?: boolean;
}

export function SocialFileInput({
  label,
  error,
  hint,
  accept,
  multiple = false,
  onChange,
  disabled = false,
  className = '',
  dragAndDrop = true
}: SocialFileInputProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      onChange?.(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div
        className={`
          relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg
          transition-colors duration-200 hover:border-gray-400 dark:hover:border-gray-500
          ${dragAndDrop ? 'cursor-pointer' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500 dark:border-red-400' : ''}
          ${className}
        `}
        onDrop={dragAndDrop ? handleDrop : undefined}
        onDragOver={dragAndDrop ? handleDragOver : undefined}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dragAndDrop ? (
                <>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Clique para enviar
                  </span>{' '}
                  ou arraste e solte
                </>
              ) : (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Clique para selecionar arquivo{multiple ? 's' : ''}
                </span>
              )}
            </p>
            {accept && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formatos aceitos: {accept}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {(error || hint) && (
        <div className="text-sm">
          {error ? (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          ) : hint ? (
            <p className="text-gray-500 dark:text-gray-400">{hint}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Form group component for better organization
interface SocialFormGroupProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export function SocialFormGroup({
  children,
  className = '',
  spacing = 'md'
}: SocialFormGroupProps) {
  const spacingClasses = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}
