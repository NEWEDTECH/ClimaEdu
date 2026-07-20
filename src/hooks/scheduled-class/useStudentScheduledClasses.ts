'use client'

import { useState, useEffect, useCallback } from 'react'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container'
import { ListStudentScheduledClassesUseCase } from '@/_core/modules/scheduled-class'
import type { StudentScheduledClassItem } from '@/_core/modules/scheduled-class'

interface UseStudentScheduledClassesState {
  items: StudentScheduledClassItem[]
  loading: boolean
  error: string | null
}

interface UseStudentScheduledClassesOptions {
  studentId: string
  institutionId: string
}

export function useStudentScheduledClasses(options: UseStudentScheduledClassesOptions) {
  const [state, setState] = useState<UseStudentScheduledClassesState>({
    items: [],
    loading: true,
    error: null
  })

  const fetchScheduledClasses = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const useCase = container.get<ListStudentScheduledClassesUseCase>(
        Register.scheduledClass.useCase.ListStudentScheduledClassesUseCase
      )

      const result = await useCase.execute({
        studentId: options.studentId,
        institutionId: options.institutionId
      })

      setState({
        items: result.items,
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar aulas agendadas'
      }))
    }
  }, [options.studentId, options.institutionId])

  useEffect(() => {
    if (options.studentId && options.institutionId) {
      fetchScheduledClasses()
    }
  }, [options.studentId, options.institutionId, fetchScheduledClasses])

  // Upcoming classes (scheduled and not happened yet), soonest first
  const upcomingItems = state.items
    .filter(item => item.scheduledClass.isUpcoming())
    .sort((a, b) => a.scheduledClass.scheduledDate.getTime() - b.scheduledClass.scheduledDate.getTime())

  // Past classes (already happened or cancelled), most recent first
  const pastItems = state.items
    .filter(item => !item.scheduledClass.isUpcoming())
    .sort((a, b) => b.scheduledClass.scheduledDate.getTime() - a.scheduledClass.scheduledDate.getTime())

  return {
    ...state,
    upcomingItems,
    pastItems,
    refetch: fetchScheduledClasses
  }
}
