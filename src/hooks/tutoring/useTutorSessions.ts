'use client'

import { useState, useEffect } from 'react'
import { container } from '@/_core/shared/container/container'
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols'
import { GetTutorSessionsUseCase, UpdateSessionStatusUseCase, AddSessionNotesUseCase, UpdateTutoringSessionUseCase } from '@/_core/modules/tutoring'
import type { TutoringSession, TutoringSessionStatus, SessionPriority } from '@/_core/modules/tutoring'

interface UseTutorSessionsState {
  sessions: TutoringSession[]
  loading: boolean
  error: string | null
  updating: boolean
}

interface UseTutorSessionsOptions {
  tutorId: string
  status?: TutoringSessionStatus
  priority?: SessionPriority
  autoRefresh?: boolean
}

export function useTutorSessions(options: UseTutorSessionsOptions) {
  const [state, setState] = useState<UseTutorSessionsState>({
    sessions: [],
    loading: true,
    error: null,
    updating: false
  })

  const fetchSessions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const useCase = container.get<GetTutorSessionsUseCase>(
        TutoringSymbols.useCases.GetTutorSessionsUseCase
      )

      const result = await useCase.execute({
        tutorId: options.tutorId,
        status: options.status,
        priority: options.priority,
        dateFilter: undefined, // No date filter by default
        includeStats: false
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

  const updateSessionStatus = async (sessionId: string, newStatus: TutoringSessionStatus) => {
    try {
      setState(prev => ({ ...prev, updating: true, error: null }))

      const useCase = container.get<UpdateSessionStatusUseCase>(
        TutoringSymbols.useCases.UpdateSessionStatusUseCase
      )

      await useCase.execute({
        sessionId,
        tutorId: options.tutorId,
        newStatus
      })

      // Refresh sessions after update
      await fetchSessions()

      setState(prev => ({ ...prev, updating: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        updating: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar sessão'
      }))
      throw error
    }
  }

  const addSessionNotes = async (sessionId: string, notes: string) => {
    try {
      setState(prev => ({ ...prev, updating: true, error: null }))

      const useCase = container.get<AddSessionNotesUseCase>(
        TutoringSymbols.useCases.AddSessionNotesUseCase
      )

      await useCase.execute({
        sessionId,
        tutorId: options.tutorId,
        notes
      })

      // Refresh sessions after adding notes
      await fetchSessions()

      setState(prev => ({ ...prev, updating: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        updating: false,
        error: error instanceof Error ? error.message : 'Erro ao adicionar notas'
      }))
      throw error
    }
  }

  const updateSession = async (updatedSession: TutoringSession) => {
    try {
      setState(prev => ({ ...prev, updating: true, error: null }))

      const useCase = container.get<UpdateTutoringSessionUseCase>(
        TutoringSymbols.useCases.UpdateTutoringSessionUseCase
      )

      await useCase.execute({
        sessionId: updatedSession.id,
        tutorId: options.tutorId,
        updatedSession
      })

      // Refresh sessions after update
      await fetchSessions()

      setState(prev => ({ ...prev, updating: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        updating: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar sessão'
      }))
      throw error
    }
  }

  useEffect(() => {
    if (options.tutorId) {
      fetchSessions()
    }
  }, [options.tutorId, options.status, options.priority])

  // Auto-refresh every 15 minutes if enabled
  useEffect(() => {
    if (options.autoRefresh && options.tutorId) {
      const interval = setInterval(fetchSessions, 900000) // 15 minutes = 900,000ms
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.tutorId])

  return {
    ...state,
    refetch: fetchSessions,
    updateSessionStatus,
    addSessionNotes,
    updateSession
  }
}
