'use client'

import { useState, useEffect, useCallback } from 'react'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container'
import {
  ScheduleClassUseCase,
  UpdateScheduledClassUseCase,
  CancelScheduledClassUseCase,
  ListTutorScheduledClassesUseCase,
  ListTutorClassesUseCase
} from '@/_core/modules/scheduled-class'
import type { ScheduledClass, TutorClassOption } from '@/_core/modules/scheduled-class'
import { ListClassStudentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-class-students'
import { CreateNotificationUseCase, CreateNotificationInput } from '@/_core/modules/notification/core/use-cases/create-notification'
import type { NotificationType } from '@/_core/modules/notification/core/entities/Notification'
import { useProfile } from '@/context/zustand/useProfile'

interface UseTutorScheduledClassesState {
  scheduledClasses: ScheduledClass[]
  tutorClasses: TutorClassOption[]
  loading: boolean
  error: string | null
  saving: boolean
}

interface UseTutorScheduledClassesOptions {
  tutorId: string
  institutionId: string
}

export interface ScheduleClassData {
  classId: string
  scheduledDate: Date
  meetingUrl: string
  title?: string
}

export interface UpdateScheduledClassData {
  scheduledClassId: string
  classId: string
  scheduledDate: Date
  meetingUrl: string
  title?: string
}

const formatDateTime = (date: Date): string =>
  `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

export function useTutorScheduledClasses(options: UseTutorScheduledClassesOptions) {
  const { infoUser } = useProfile()

  const [state, setState] = useState<UseTutorScheduledClassesState>({
    scheduledClasses: [],
    tutorClasses: [],
    loading: true,
    error: null,
    saving: false
  })

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const listScheduledClasses = container.get<ListTutorScheduledClassesUseCase>(
        Register.scheduledClass.useCase.ListTutorScheduledClassesUseCase
      )
      const listTutorClasses = container.get<ListTutorClassesUseCase>(
        Register.scheduledClass.useCase.ListTutorClassesUseCase
      )

      const [scheduledResult, classesResult] = await Promise.all([
        listScheduledClasses.execute({ tutorId: options.tutorId }),
        listTutorClasses.execute({ tutorId: options.tutorId, institutionId: options.institutionId })
      ])

      setState(prev => ({
        ...prev,
        scheduledClasses: scheduledResult.scheduledClasses,
        tutorClasses: classesResult.classes,
        loading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar aulas agendadas'
      }))
    }
  }, [options.tutorId, options.institutionId])

  /**
   * Sends a notification to every student of the class (turma)
   * Follows the same fire-and-forget pattern used by useTutoringScheduler
   */
  const notifyClassStudents = async (
    type: NotificationType,
    scheduledClass: ScheduledClass,
    title: string,
    message: string
  ) => {
    try {
      const listClassStudents = container.get(ListClassStudentsUseCase)
      const { students } = await listClassStudents.execute({
        classId: scheduledClass.classId,
        institutionId: scheduledClass.institutionId
      })

      const createNotification = container.get<CreateNotificationUseCase>(
        Register.notification.useCase.CreateNotificationUseCase
      )

      await Promise.all(
        students
          .filter(student => student.id !== options.tutorId)
          .map(student =>
            createNotification.execute(new CreateNotificationInput(
              student.id,
              options.tutorId,
              infoUser.name || 'Tutor',
              type,
              title,
              message,
              scheduledClass.id
            ))
          )
      )
    } catch (notifError) {
      console.error('Failed to send scheduled class notifications:', notifError)
    }
  }

  const getClassName = (classId: string): string =>
    state.tutorClasses.find(option => option.classId === classId)?.className ?? 'sua turma'

  const scheduleClass = async (data: ScheduleClassData) => {
    try {
      setState(prev => ({ ...prev, saving: true, error: null }))

      const useCase = container.get<ScheduleClassUseCase>(
        Register.scheduledClass.useCase.ScheduleClassUseCase
      )

      const result = await useCase.execute({
        tutorId: options.tutorId,
        classId: data.classId,
        scheduledDate: data.scheduledDate,
        meetingUrl: data.meetingUrl,
        title: data.title
      })

      const className = getClassName(data.classId)
      await notifyClassStudents(
        'CLASS_SCHEDULED',
        result.scheduledClass,
        'Nova aula agendada',
        `${result.scheduledClass.title ? `"${result.scheduledClass.title}" — ` : ''}Aula da turma ${className} agendada para ${formatDateTime(result.scheduledClass.scheduledDate)}. Link: ${result.scheduledClass.meetingUrl}`
      )

      await fetchData()
      setState(prev => ({ ...prev, saving: false }))
      return result.scheduledClass
    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : 'Erro ao agendar aula'
      }))
      throw error
    }
  }

  const updateScheduledClass = async (data: UpdateScheduledClassData) => {
    try {
      setState(prev => ({ ...prev, saving: true, error: null }))

      const useCase = container.get<UpdateScheduledClassUseCase>(
        Register.scheduledClass.useCase.UpdateScheduledClassUseCase
      )

      const result = await useCase.execute({
        scheduledClassId: data.scheduledClassId,
        tutorId: options.tutorId,
        scheduledDate: data.scheduledDate,
        meetingUrl: data.meetingUrl,
        title: data.title
      })

      const className = getClassName(result.scheduledClass.classId)
      await notifyClassStudents(
        'CLASS_UPDATED',
        result.scheduledClass,
        'Aula atualizada',
        `A aula da turma ${className} foi atualizada para ${formatDateTime(result.scheduledClass.scheduledDate)}. Link: ${result.scheduledClass.meetingUrl}`
      )

      await fetchData()
      setState(prev => ({ ...prev, saving: false }))
      return result.scheduledClass
    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar aula'
      }))
      throw error
    }
  }

  const cancelScheduledClass = async (scheduledClassId: string, reason?: string) => {
    try {
      setState(prev => ({ ...prev, saving: true, error: null }))

      const useCase = container.get<CancelScheduledClassUseCase>(
        Register.scheduledClass.useCase.CancelScheduledClassUseCase
      )

      const result = await useCase.execute({
        scheduledClassId,
        tutorId: options.tutorId,
        reason
      })

      const className = getClassName(result.scheduledClass.classId)
      await notifyClassStudents(
        'CLASS_CANCELLED',
        result.scheduledClass,
        'Aula cancelada',
        `A aula da turma ${className} de ${formatDateTime(result.scheduledClass.scheduledDate)} foi cancelada.${reason ? ` Motivo: ${reason}` : ''}`
      )

      await fetchData()
      setState(prev => ({ ...prev, saving: false }))
      return result.scheduledClass
    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar aula'
      }))
      throw error
    }
  }

  useEffect(() => {
    if (options.tutorId && options.institutionId) {
      fetchData()
    }
  }, [options.tutorId, options.institutionId, fetchData])

  return {
    ...state,
    refetch: fetchData,
    scheduleClass,
    updateScheduledClass,
    cancelScheduledClass
  }
}
