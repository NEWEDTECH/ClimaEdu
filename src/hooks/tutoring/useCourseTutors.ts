'use client'

import { useState, useEffect } from 'react'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container'
import { ListCourseTutorsUseCase } from '@/_core/modules/content/core/use-cases/list-course-tutors'
import type { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import type { UserInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/UserInstitutionRepository'
import { UserRole } from '@/_core/modules/user/core/entities/User'

export interface CourseTutorOption {
  id: string
  name: string
}

interface UseCourseTutorsState {
  tutors: CourseTutorOption[]
  loading: boolean
  error: string | null
}

/**
 * Loads the tutors of a course (with their names) for the student to pick from.
 * course_tutors também guarda os vínculos de gestores de conteúdo com o curso, então só
 * entram usuários que existem e têm o papel de TUTOR (em uma instituição ou como cargo principal).
 */
export function useCourseTutors(courseId: string | null) {
  const [state, setState] = useState<UseCourseTutorsState>({
    tutors: [],
    loading: false,
    error: null
  })

  useEffect(() => {
    if (!courseId) {
      setState({ tutors: [], loading: false, error: null })
      return
    }

    let cancelled = false

    const fetchTutors = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        const listCourseTutors = container.get<ListCourseTutorsUseCase>(
          Register.content.useCase.ListCourseTutorsUseCase
        )
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )
        const userInstitutionRepository = container.get<UserInstitutionRepository>(
          Register.institution.repository.UserInstitutionRepository
        )

        const { tutors: courseTutors } = await listCourseTutors.execute({ courseId })

        const tutors = (
          await Promise.all(
            courseTutors.map(async courseTutor => {
              const user = await userRepository.findById(courseTutor.userId)
              if (!user) return null

              const associations = await userInstitutionRepository.findByUserId(user.id)
              const isTutor =
                user.role === UserRole.TUTOR ||
                associations.some(association => association.userRole === UserRole.TUTOR)

              return isTutor ? { id: user.id, name: user.name } : null
            })
          )
        ).filter((tutor): tutor is CourseTutorOption => tutor !== null)

        if (!cancelled) {
          setState({ tutors, loading: false, error: null })
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            tutors: [],
            loading: false,
            error: error instanceof Error ? error.message : 'Erro ao carregar tutores'
          })
        }
      }
    }

    fetchTutors()

    return () => {
      cancelled = true
    }
  }, [courseId])

  return state
}
