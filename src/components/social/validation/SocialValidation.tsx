'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { Button } from '@/components/button'

// Validation schemas
export const postSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  content: z.string()
    .min(1, 'Conteúdo é obrigatório')
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(50000, 'Conteúdo deve ter no máximo 50.000 caracteres'),
  excerpt: z.string()
    .max(500, 'Resumo deve ter no máximo 500 caracteres')
    .optional(),
  tags: z.array(z.string())
    .max(10, 'Máximo de 10 tags permitidas')
    .optional(),
  status: z.enum(['draft', 'published', 'archived'])
    .optional()
});

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comentário é obrigatório')
    .min(3, 'Comentário deve ter pelo menos 3 caracteres')
    .max(2000, 'Comentário deve ter no máximo 2.000 caracteres'),
  parentId: z.string().optional()
});

export const searchSchema = z.object({
  query: z.string()
    .min(2, 'Busca deve ter pelo menos 2 caracteres')
    .max(100, 'Busca deve ter no máximo 100 caracteres'),
  filters: z.object({
    author: z.string().optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }).optional()
});

// Types
export type PostFormData = z.infer<typeof postSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;

// Validation hook
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback((data: unknown): data is T => {
    try {
      schema.parse(data);
      setErrors({});
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      }
      setIsValid(false);
      return false;
    }
  }, [schema]);

  const validateField = useCallback((field: string) => {
    // Simplified field validation - just clear the error for now
    // Full validation will happen on form submit
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const getFieldError = useCallback((field: string) => {
    return errors[field];
  }, [errors]);

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    getFieldError
  };
}

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class SocialErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Social module error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to error reporting service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Implementation for error logging service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Send to logging service (implement based on your needs)
    console.error('Error logged:', errorData);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Algo deu errado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
          </p>
          <div className="space-x-3">
            <Button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Recarregar página
            </Button>
            <Button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Tentar novamente
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-w-2xl">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Form validation wrapper
interface ValidatedFormProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  schema: z.ZodSchema;
  className?: string;
}

export function ValidatedForm({ children, onSubmit, schema, className = '' }: ValidatedFormProps) {
  const { validate } = useFormValidation(schema);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (!validate(data)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {children}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Enviando...</span>
          </div>
        </div>
      )}
    </form>
  );
}

// Input sanitization utilities
export const sanitizeInput = {
  text: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML chars
      .slice(0, 10000); // Limit length
  },
  
  html: (input: string): string => {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },
  
  url: (input: string): string => {
    try {
      const url = new URL(input);
      return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
    } catch {
      return '';
    }
  }
};

// Rate limiting hook
export function useRateLimit(limit: number, windowMs: number) {
  const [attempts, setAttempts] = useState<number[]>([]);

  const isAllowed = useCallback(() => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Filter attempts within the current window
    const recentAttempts = attempts.filter(time => time > windowStart);
    
    if (recentAttempts.length >= limit) {
      return false;
    }
    
    // Add current attempt
    setAttempts(prev => [...prev.filter(time => time > windowStart), now]);
    return true;
  }, [attempts, limit, windowMs]);

  const getRemainingTime = useCallback(() => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const recentAttempts = attempts.filter(time => time > windowStart);
    
    if (recentAttempts.length < limit) {
      return 0;
    }
    
    const oldestAttempt = Math.min(...recentAttempts);
    return Math.max(0, oldestAttempt + windowMs - now);
  }, [attempts, limit, windowMs]);

  return { isAllowed, getRemainingTime };
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection info if available
    const connection = (navigator as Navigator & {
      connection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
      mozConnection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
      webkitConnection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
    }).connection || (navigator as Navigator & {
      connection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
      mozConnection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
      webkitConnection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
    }).mozConnection || (navigator as Navigator & {
      connection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
      mozConnection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
      webkitConnection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void };
    }).webkitConnection;
    if (connection) {
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
}

// Import React
import React from 'react';
