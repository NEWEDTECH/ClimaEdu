'use client'

import { useState, useCallback } from 'react'
import { container } from '@/_core/shared/container/container'
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols'
import { CreateTimeSlotUseCase, TimeSlot, DayOfWeek } from '@/_core/modules/tutoring'
import type { TimeSlotRepository } from '@/_core/modules/tutoring'

interface UseAvailabilityManagerState {
  loading: boolean
  error: string | null
  timeSlots: TimeSlot[]
}

interface CreateTimeSlotData {
  tutorId: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  recurrenceEndDate?: Date
}

export function useAvailabilityManager(tutorId: string) {
  const [state, setState] = useState<UseAvailabilityManagerState>({
    loading: false,
    error: null,
    timeSlots: []
  })

  const loadTimeSlots = useCallback(async () => {
    if (!tutorId) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const repository = container.get<TimeSlotRepository>(
        TutoringSymbols.repositories.TimeSlotRepository
      )

      const timeSlots = await repository.findByTutorId(tutorId, true)

      setState(prev => ({
        ...prev,
        loading: false,
        timeSlots
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar disponibilidade'
      }))
    }
  }, [tutorId])

  const createTimeSlot = useCallback(async (data: CreateTimeSlotData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const useCase = container.get<CreateTimeSlotUseCase>(
        TutoringSymbols.useCases.CreateTimeSlotUseCase
      )

      const result = await useCase.execute(data)

      setState(prev => ({
        ...prev,
        loading: false,
        timeSlots: [...prev.timeSlots, result.timeSlot]
      }))

      return result.timeSlot
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao criar horário'
      }))
      throw error
    }
  }, [])

  const deleteTimeSlot = useCallback(async (timeSlotId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const repository = container.get<TimeSlotRepository>(
        TutoringSymbols.repositories.TimeSlotRepository
      )

      await repository.delete(timeSlotId)

      setState(prev => ({
        ...prev,
        loading: false,
        timeSlots: prev.timeSlots.filter(slot => slot.id !== timeSlotId)
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao excluir horário'
      }))
      throw error
    }
  }, [])

  const updateTimeSlotAvailability = useCallback(async (timeSlotId: string, isAvailable: boolean) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const repository = container.get<TimeSlotRepository>(
        TutoringSymbols.repositories.TimeSlotRepository
      )

      const timeSlot = await repository.findById(timeSlotId)
      if (!timeSlot) {
        throw new Error('Horário não encontrado')
      }

      timeSlot.setAvailability(isAvailable)
      await repository.save(timeSlot)

      setState(prev => ({
        ...prev,
        loading: false,
        timeSlots: prev.timeSlots.map(slot => 
          slot.id === timeSlotId ? timeSlot : slot
        )
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade'
      }))
      throw error
    }
  }, [])

  return {
    ...state,
    loadTimeSlots,
    createTimeSlot,
    deleteTimeSlot,
    updateTimeSlotAvailability
  }
}
