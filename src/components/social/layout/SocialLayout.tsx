'use client';

import { ReactNode } from 'react';
import { socialTheme, socialCSSVariables } from '../design/SocialTheme';

interface SocialLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
}

export function SocialLayout({
  children,
  sidebar,
  header,
  className = '',
  maxWidth = 'xl',
  centered = true
}: SocialLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',      // 672px
    md: 'max-w-4xl',      // 896px
    lg: 'max-w-6xl',      // 1152px
    xl: 'max-w-7xl',      // 1280px
    '2xl': 'max-w-8xl',   // 1536px
    full: 'max-w-none'
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--social-bg-secondary, #f8fafc)',
        ...socialCSSVariables.light
      }}
    >
      {/* Apply CSS variables for theming */}
      <style jsx>{`
        :global(.dark) {
          --social-bg-primary: ${socialTheme.colors.background.dark.primary};
          --social-bg-secondary: ${socialTheme.colors.background.dark.secondary};
          --social-bg-tertiary: ${socialTheme.colors.background.dark.tertiary};
          --social-text-primary: ${socialTheme.colors.neutral[50]};
          --social-text-secondary: ${socialTheme.colors.neutral[300]};
          --social-text-tertiary: ${socialTheme.colors.neutral[400]};
          --social-border-primary: ${socialTheme.colors.neutral[700]};
          --social-border-secondary: ${socialTheme.colors.neutral[800]};
        }
      `}</style>

      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className={`${maxWidthClasses[maxWidth]} ${centered ? 'mx-auto' : ''} px-4 sm:px-6 lg:px-8`}>
            {header}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`${maxWidthClasses[maxWidth]} ${centered ? 'mx-auto' : ''} px-4 sm:px-6 lg:px-8 py-6 lg:py-8`}>
        {sidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              {children}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="sticky top-24 space-y-6">
                {sidebar}
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}

// Specialized layouts for different social pages
export function SocialFeedLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <SocialLayout maxWidth="xl" className={className}>
      {children}
    </SocialLayout>
  );
}

export function SocialPostLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <SocialLayout maxWidth="lg" className={className}>
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </SocialLayout>
  );
}

export function SocialCreateLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <SocialLayout maxWidth="md" className={className}>
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </SocialLayout>
  );
}

// Responsive container component
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'transparent' | 'primary' | 'secondary';
  rounded?: boolean;
  shadow?: boolean;
  border?: boolean;
}

export function ResponsiveContainer({
  children,
  className = '',
  padding = 'md',
  background = 'primary',
  rounded = true,
  shadow = true,
  border = true
}: ResponsiveContainerProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const backgroundClasses = {
    transparent: 'bg-transparent',
    primary: 'bg-white dark:bg-gray-800',
    secondary: 'bg-gray-50 dark:bg-gray-900'
  };

  return (
    <div
      className={`
        ${paddingClasses[padding]}
        ${backgroundClasses[background]}
        ${rounded ? 'rounded-xl' : ''}
        ${shadow ? 'shadow-sm hover:shadow-md transition-shadow duration-300' : ''}
        ${border ? 'border border-gray-200 dark:border-gray-700' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Mobile-optimized navigation
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MobileNav({ isOpen, onClose, children }: MobileNavProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Navigation Panel */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-80 bg-white dark:bg-gray-800 
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </>
  );
}

// Responsive grid for posts
interface PostGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PostGrid({ 
  children, 
  columns = 1, 
  gap = 'md',
  className = '' 
}: PostGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

// Responsive text component with proper typography
interface ResponsiveTextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'overline';
  className?: string;
  color?: 'primary' | 'secondary' | 'tertiary';
  align?: 'left' | 'center' | 'right';
}

export function ResponsiveText({
  children,
  variant = 'body',
  className = '',
  color = 'primary',
  align = 'left'
}: ResponsiveTextProps) {
  const variantClasses = {
    h1: 'text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight',
    h2: 'text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight',
    h3: 'text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight',
    h4: 'text-lg sm:text-xl lg:text-2xl font-semibold leading-tight',
    body: 'text-base sm:text-lg leading-relaxed',
    caption: 'text-sm sm:text-base leading-normal',
    overline: 'text-xs sm:text-sm font-medium uppercase tracking-wide leading-normal'
  };

  const colorClasses = {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400'
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  if (variant === 'h1') {
    return (
      <h1 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]} ${className}`}>
        {children}
      </h1>
    );
  }
  
  if (variant === 'h2') {
    return (
      <h2 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]} ${className}`}>
        {children}
      </h2>
    );
  }
  
  if (variant === 'h3') {
    return (
      <h3 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]} ${className}`}>
        {children}
      </h3>
    );
  }
  
  if (variant === 'h4') {
    return (
      <h4 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]} ${className}`}>
        {children}
      </h4>
    );
  }

  return (
    <p className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]} ${className}`}>
      {children}
    </p>
  );
}

// Breakpoint hook for responsive behavior
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('sm');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

// Import React hooks
import { useState, useEffect } from 'react';
