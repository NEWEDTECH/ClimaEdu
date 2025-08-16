'use client'

import { useState, useEffect } from 'react'
import { container } from '@/_core/shared/container/container'
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols'
import { GetSessionDetailsUseCase } from '@/_core/modules/tutoring'
import type { TutoringSession } from '@/_core/modules/tutoring'

interface UseSessionDetailsState {
  session: TutoringSession | null
  loading: boolean
  error: string | null
}

interface UseSessionDetailsOptions {
  sessionId: string
  userId: string
}

export function useSessionDetails(options: UseSessionDetailsOptions) {
  const [state, setState] = useState<UseSessionDetailsState>({
    session: null,
    loading: true,
    error: null
  })

  const fetchSessionDetails = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const useCase = container.get<GetSessionDetailsUseCase>(
        TutoringSymbols.useCases.GetSessionDetailsUseCase
      )

      const result = await useCase.execute({
        sessionId: options.sessionId,
        userId: options.userId
      })

      setState({
        session: result.session,
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar detalhes da sessão'
      }))
    }
  }

  useEffect(() => {
    if (options.sessionId && options.userId) {
      fetchSessionDetails()
    }
  }, [options.sessionId, options.userId])

  return {
    ...state,
    refetch: fetchSessionDetails
  }
}
