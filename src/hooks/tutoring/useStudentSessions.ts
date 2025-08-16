'use client'

import { useState, useEffect } from 'react'
import { container } from '@/_core/shared/container/container'
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols'
import { GetStudentSessionsUseCase, CancelTutoringSessionUseCase } from '@/_core/modules/tutoring'
import type { TutoringSession, TutoringSessionStatus } from '@/_core/modules/tutoring'

interface UseStudentSessionsState {
  sessions: TutoringSession[]
  loading: boolean
  error: string | null
  cancelling: boolean
}

interface UseStudentSessionsOptions {
  studentId: string
  status?: TutoringSessionStatus
  autoRefresh?: boolean
}

export function useStudentSessions(options: UseStudentSessionsOptions) {
  const [state, setState] = useState<UseStudentSessionsState>({
    sessions: [],
    loading: true,
    error: null,
    cancelling: false
  })

  const fetchSessions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const useCase = container.get<GetStudentSessionsUseCase>(
        TutoringSymbols.useCases.GetStudentSessionsUseCase
      )

      const result = await useCase.execute({
        studentId: options.studentId,
        status: options.status,
        includeUpcoming: true,
        includePast: true
      })

      setState(prev => ({
        ...prev,
        sessions: result.sessions,
        loading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar sessões'
      }))
    }
  }

  const cancelSession = async (sessionId: string, reason: string) => {
    try {
      setState(prev => ({ ...prev, cancelling: true, error: null }))

      const useCase = container.get<CancelTutoringSessionUseCase>(
        TutoringSymbols.useCases.CancelTutoringSessionUseCase
      )

      await useCase.execute({
        sessionId,
        studentId: options.studentId,
        cancelReason: reason
      })

      // Refresh sessions after cancellation
      await fetchSessions()

      setState(prev => ({ ...prev, cancelling: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        cancelling: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar sessão'
      }))
      throw error
    }
  }

  useEffect(() => {
    if (options.studentId) {
      fetchSessions()
    }
  }, [options.studentId, options.status])

  // Auto-refresh every 15 minutes if enabled
  useEffect(() => {
    if (options.autoRefresh && options.studentId) {
      const interval = setInterval(fetchSessions, 900000) // 15 minutes = 900,000ms
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.studentId])

  return {
    ...state,
    refetch: fetchSessions,
    cancelSession
  }
}
