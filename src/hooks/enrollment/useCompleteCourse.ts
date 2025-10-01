import { useState, useCallback } from 'react';
import { Enrollment } from '@/_core/modules/enrollment';
import { Certificate } from '@/_core/modules/certificate';
import { CompleteCourseUseCase, CompleteCourseInput } from '@/_core/modules/enrollment/core/use-cases/complete-course';
import { container, Register } from '@/_core/shared/container';

interface UseCompleteCourseState {
  loading: boolean;
  error: string | null;
}

interface UseCompleteCourseReturn extends UseCompleteCourseState {
  completeCourse: (input: CompleteCourseInput) => Promise<{ enrollment: Enrollment; certificate: Certificate; wasAlreadyCompleted: boolean } | null>;
}

/**
 * Hook for completing courses
 * Provides functionality to mark courses as completed and generate certificates automatically
 */
export function useCompleteCourse(): UseCompleteCourseReturn {
  const [state, setState] = useState<UseCompleteCourseState>({
    loading: false,
    error: null,
  });

  const completeCourseUseCase = container.get<CompleteCourseUseCase>(Register.enrollment.useCase.CompleteCourseUseCase);

  const completeCourse = useCallback(async (input: CompleteCourseInput) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await completeCourseUseCase.execute(input);

      setState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete course';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    }
  }, [completeCourseUseCase]);

  return {
    ...state,
    completeCourse,
  };
}