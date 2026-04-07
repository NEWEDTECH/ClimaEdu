'use client'

import { useState } from 'react'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container'
import { TutoringSymbols } from '@/_core/shared/container/modules/tutoring/symbols'
import { ScheduleTutoringSessionUseCase } from '@/_core/modules/tutoring'
import { CreateNotificationUseCase, CreateNotificationInput } from '@/_core/modules/notification/core/use-cases/create-notification'
import { useProfile } from '@/context/zustand/useProfile'

interface UseTutoringSchedulerState {
  loading: boolean
  error: string | null
}

interface ScheduleSessionData {
  studentId: string
  courseId: string
  scheduledDate: Date
  duration: number
  studentQuestion: string
}

export function useTutoringScheduler() {
  const { infoUser } = useProfile()

  const [state, setState] = useState<UseTutoringSchedulerState>({
    loading: false,
    error: null
  })

  const scheduleSession = async (data: ScheduleSessionData) => {
    try {
      setState({ loading: true, error: null })

      const useCase = container.get<ScheduleTutoringSessionUseCase>(
        TutoringSymbols.useCases.ScheduleTutoringSessionUseCase
      )

      const result = await useCase.execute({
        studentId: data.studentId,
        courseId: data.courseId,
        scheduledDate: data.scheduledDate,
        duration: data.duration,
        studentQuestion: data.studentQuestion
      })

      // Send notification to tutor
      try {
        const createNotification = container.get<CreateNotificationUseCase>(
          Register.notification.useCase.CreateNotificationUseCase
        )
        await createNotification.execute(new CreateNotificationInput(
          result.session.tutorId,
          data.studentId,
          infoUser.name || 'Aluno',
          'TUTORING_SCHEDULED',
          'Nova tutoria agendada',
          data.studentQuestion || 'Sessão de tutoria agendada',
          result.session.id
        ))
      } catch (notifError) {
        console.error('Failed to send tutoring notification:', notifError)
      }

      setState({ loading: false, error: null })
      return result.session

    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao agendar sessão'
      })
      throw error
    }
  }

  return {
    ...state,
    scheduleSession
  }
}
