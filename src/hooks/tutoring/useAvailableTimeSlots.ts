'use client'

import { useState, useCallback } from 'react'
import { container } from '@/_core/shared/container/container'
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols'
import { FindAvailableTimeSlotsUseCase } from '@/_core/modules/tutoring'
import type { FindAvailableTimeSlotsInput, FindAvailableTimeSlotsOutput, AvailableTimeSlot } from '@/_core/modules/tutoring'

interface UseAvailableTimeSlotsState {
  loading: boolean
  error: string | null
  availableSlots: AvailableTimeSlot[]
  totalSlotsFound: number
}

export function useAvailableTimeSlots() {
  const [state, setState] = useState<UseAvailableTimeSlotsState>({
    loading: false,
    error: null,
    availableSlots: [],
    totalSlotsFound: 0
  })

  const findAvailableSlots = useCallback(async (input: FindAvailableTimeSlotsInput) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const useCase = container.get<FindAvailableTimeSlotsUseCase>(
        TutoringSymbols.useCases.FindAvailableTimeSlotsUseCase
      )

      const result: FindAvailableTimeSlotsOutput = await useCase.execute(input)

      setState(prev => ({
        ...prev,
        loading: false,
        availableSlots: result.availableSlots,
        totalSlotsFound: result.totalSlotsFound
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar horários disponíveis'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        availableSlots: [],
        totalSlotsFound: 0
      }))
      
      throw error
    }
  }, [])

  const clearResults = useCallback(() => {
    setState({
      loading: false,
      error: null,
      availableSlots: [],
      totalSlotsFound: 0
    })
  }, [])

  return {
    ...state,
    findAvailableSlots,
    clearResults
  }
}
