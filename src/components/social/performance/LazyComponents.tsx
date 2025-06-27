'use client';

import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { SocialButton } from '../ui/SocialButton';

// Loading fallback components
export function ComponentSkeleton({ 
  height = 'h-32', 
  className = '' 
}: { 
  height?: string; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${height} ${className}`}>
      <div className="flex space-x-4 p-4">
        <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Author info skeleton */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-10 w-10"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
        </div>
      </div>
      
      {/* Title skeleton */}
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
      
      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>
      
      {/* Actions skeleton */}
      <div className="flex items-center space-x-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="animate-pulse border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-3">
      <div className="flex items-start space-x-3">
        <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-8 w-8"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Error boundary for lazy components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Erro ao carregar componente
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ocorreu um erro ao carregar este componente. Tente recarregar a página.
          </p>
          <SocialButton 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </SocialButton>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy loading wrapper with error boundary
export function withLazyLoading(
  importFn: () => Promise<{ default: ComponentType }>,
  fallback?: ReactNode,
  errorFallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: Record<string, unknown>) {
    return (
      <LazyErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback || <ComponentSkeleton />}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

// Example of how to use lazy loading (components will be created later)
// export const LazyPostEditor = withLazyLoading(
//   () => import('../post/PostEditor'),
//   <ComponentSkeleton height="h-96" />
// );

// Progressive loading hook
export function useProgressiveLoading<T>(
  loadFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loadFn();
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
}

// Preload component for critical resources
export function PreloadComponent({ 
  importFn, 
  when = true 
}: { 
  importFn: () => Promise<any>; 
  when?: boolean; 
}) {
  useEffect(() => {
    if (when) {
      // Preload the component
      importFn().catch(console.error);
    }
  }, [importFn, when]);

  return null;
}

// Import React hooks
import React, { useState, useEffect, useRef } from 'react';
