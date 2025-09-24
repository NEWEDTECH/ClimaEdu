'use client'

import { useState, useEffect, useCallback } from 'react'
import { container } from '@/_core/shared/container/container'
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols'
import { GetStudentEnrolledCoursesUseCase } from '@/_core/modules/tutoring'
import type { Course } from '@/_core/modules/content'

interface UseStudentEnrolledCoursesState {
  courses: Course[]
  loading: boolean
  error: string | null
}

interface UseStudentEnrolledCoursesOptions {
  studentId: string
}

export function useStudentEnrolledCourses({ studentId }: UseStudentEnrolledCoursesOptions) {
  const [state, setState] = useState<UseStudentEnrolledCoursesState>({
    courses: [],
    loading: true,
    error: null
  })

  const fetchCourses = useCallback(async () => {
    if (!studentId) {
      setState({
        courses: [],
        loading: false,
        error: null
      })
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const useCase = container.get<GetStudentEnrolledCoursesUseCase>(
        TutoringSymbols.useCases.GetStudentEnrolledCoursesUseCase
      )

      const result = await useCase.execute({ studentId })

      setState({
        courses: result.courses,
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar cursos'
      }))
    }
  }, [studentId])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return {
    ...state,
    refetch: fetchCourses
  }
}
