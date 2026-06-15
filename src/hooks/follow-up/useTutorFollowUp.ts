'use client'

import { useState, useEffect, useCallback } from 'react'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container'
import { ListTutorCoursesWithStudentsUseCase, LessonProgressStatus } from '@/_core/modules/content'
import type { LessonProgressRepository, LessonProgress, Course } from '@/_core/modules/content'

export interface StudentCourseData {
  id: string
  title: string
  progress: number
  lastActivity: string | null
  completedLessons: number
  totalLessons: number
  grade: number | null
}

export interface StudentFollowUpData {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  enrolledCourses: StudentCourseData[]
}

interface UseTutorFollowUpState {
  students: StudentFollowUpData[]
  courses: Course[]
  loading: boolean
  error: string | null
}

export function useTutorFollowUp(tutorId: string, institutionId: string) {
  const [state, setState] = useState<UseTutorFollowUpState>({
    students: [],
    courses: [],
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    console.log('[useTutorFollowUp] fetchData chamado', { tutorId, institutionId })

    if (!tutorId || !institutionId) {
      console.warn('[useTutorFollowUp] tutorId ou institutionId ausente, abortando')
      setState({ students: [], courses: [], loading: false, error: null })
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      console.log('[useTutorFollowUp] buscando cursos com alunos...')
      const listUseCase = container.get<ListTutorCoursesWithStudentsUseCase>(
        Register.content.useCase.ListTutorCoursesWithStudentsUseCase
      )
      const { coursesWithStudents } = await listUseCase.execute({ tutorId, institutionId })
      console.log('[useTutorFollowUp] cursos retornados:', coursesWithStudents.length)

      const allCourses = coursesWithStudents.map(c => c.course)

      // Invert to student-centric: studentId → { user info, courses }
      const studentMap = new Map<string, {
        name: string
        email: string
        avatarUrl: string | null
        courses: Course[]
      }>()

      for (const { course, students } of coursesWithStudents) {
        for (const student of students) {
          const existing = studentMap.get(student.id)
          if (existing) {
            existing.courses.push(course)
          } else {
            studentMap.set(student.id, {
              name: student.name,
              email: student.email.value,
              avatarUrl: student.profile?.avatarUrl ?? null,
              courses: [course],
            })
          }
        }
      }

      console.log('[useTutorFollowUp] total de alunos únicos:', studentMap.size)

      const lessonProgressRepo = container.get<LessonProgressRepository>(
        Register.content.repository.LessonProgressRepository
      )

      const students: StudentFollowUpData[] = await Promise.all(
        Array.from(studentMap.entries()).map(async ([studentId, data]) => {
          console.log(`[useTutorFollowUp] buscando progress do aluno: ${studentId} (${data.name})`)
          let lessonProgresses: LessonProgress[] = []
          try {
            lessonProgresses = await lessonProgressRepo.findByUserAndInstitution(
              studentId,
              institutionId
            )
            console.log(`[useTutorFollowUp] progress do aluno ${data.name}: ${lessonProgresses.length} registros`)
          } catch (err) {
            console.error(`[useTutorFollowUp] ERRO ao buscar progress do aluno ${studentId}:`, err)
          }
          const progressByLesson = new Map(lessonProgresses.map(lp => [lp.lessonId, lp]))

          const enrolledCourses: StudentCourseData[] = data.courses.map((course) => {
            const courseLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id))
            const totalLessons = courseLessonIds.length

            let completedLessons = 0
            let totalProgress = 0

            for (const lessonId of courseLessonIds) {
              const lp = progressByLesson.get(lessonId)
              if (!lp) continue
              if (lp.status === LessonProgressStatus.COMPLETED) {
                completedLessons++
                totalProgress += 100
              } else if (lp.status === LessonProgressStatus.IN_PROGRESS) {
                const cps = lp.contentProgresses
                if (cps.length > 0) {
                  totalProgress += cps.reduce((s, cp) => s + cp.progressPercentage, 0) / cps.length
                }
              }
            }

            const progressPercentage = totalLessons > 0
              ? Math.round(totalProgress / totalLessons)
              : 0

            const courseProgresses = courseLessonIds
              .map(id => progressByLesson.get(id))
              .filter((lp): lp is LessonProgress => lp !== undefined)

            let lastActivity: string | null = null
            if (courseProgresses.length > 0) {
              const maxDate = courseProgresses.reduce(
                (max, lp) => (lp.lastAccessedAt > max ? lp.lastAccessedAt : max),
                courseProgresses[0].lastAccessedAt
              )
              lastActivity = maxDate.toISOString()
            }

            return {
              id: course.id,
              title: course.title,
              progress: progressPercentage,
              lastActivity,
              completedLessons,
              totalLessons,
              grade: null,
            }
          })

          return {
            id: studentId,
            name: data.name,
            email: data.email,
            avatarUrl: data.avatarUrl,
            enrolledCourses,
          }
        })
      )

      console.log('[useTutorFollowUp] CONCLUÍDO — alunos:', students.length, '| cursos:', allCourses.length)
      setState({ students, courses: allCourses, loading: false, error: null })
    } catch (error) {
      console.error('[useTutorFollowUp] ERRO GERAL:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados dos alunos',
      }))
    }
  }, [tutorId, institutionId])

  useEffect(() => {
    console.log('[useTutorFollowUp] useEffect disparado — fetchData recriado ou IDs mudaram')
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}
