'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { container } from '@/_core/shared/container/container'
import { Register } from '@/_core/shared/container'
import { ListQuestionnaireSubmissionsForTutorUseCase, LessonProgressStatus } from '@/_core/modules/content'
import type { LessonProgressRepository, Course } from '@/_core/modules/content'

export type ActivityType =
  | 'lesson_completion'
  | 'questionnaire_submission'
  | 'certificate_earned'
  | 'discussion_post'
  | 'activity_submission'

export interface ActivityItem {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseTitle: string
  type: ActivityType
  title: string
  timestamp: string
  score?: number
}

interface UseStudentActivitiesState {
  activities: ActivityItem[]
  loading: boolean
  error: string | null
}

export function useStudentActivities(
  studentId: string | null,
  studentName: string,
  tutorId: string,
  institutionId: string,
  allCourses: Course[]
) {
  const [state, setState] = useState<UseStudentActivitiesState>({
    activities: [],
    loading: false,
    error: null,
  })

  // Keep a ref so fetchActivities can read the latest courses without being
  // in the useCallback dependency array (avoids Firestore listener churn when
  // the courses array reference changes between renders).
  const coursesRef = useRef(allCourses)
  useEffect(() => {
    coursesRef.current = allCourses
  }, [allCourses])

  // studentName is display-only — keep a ref so it stays current without
  // adding it to the dependency array and re-triggering fetches.
  const studentNameRef = useRef(studentName)
  useEffect(() => {
    studentNameRef.current = studentName
  }, [studentName])

  const fetchActivities = useCallback(async () => {
    console.log('[useStudentActivities] fetchActivities chamado', { studentId, tutorId, institutionId })

    if (!studentId || !tutorId || !institutionId) {
      console.log('[useStudentActivities] ids ausentes, abortando')
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const courses = coursesRef.current
      console.log('[useStudentActivities] cursos disponíveis:', courses.length)

      // Lesson lookup: lessonId → { title, courseId, courseTitle }
      const lessonLookup = new Map<string, { title: string; courseId: string; courseTitle: string }>()
      for (const course of courses) {
        for (const mod of course.modules) {
          for (const lesson of mod.lessons) {
            lessonLookup.set(lesson.id, {
              title: lesson.title,
              courseId: course.id,
              courseTitle: course.title,
            })
          }
        }
      }
      console.log('[useStudentActivities] lessonLookup entries:', lessonLookup.size)

      const lessonProgressRepo = container.get<LessonProgressRepository>(
        Register.content.repository.LessonProgressRepository
      )
      console.log('[useStudentActivities] buscando lesson progress para aluno', studentId)
      const lessonProgresses = await lessonProgressRepo.findByUserAndInstitution(
        studentId,
        institutionId
      )
      console.log('[useStudentActivities] lesson progresses encontrados:', lessonProgresses.length)

      const activities: ActivityItem[] = []

      for (const lp of lessonProgresses) {
        if (lp.status === LessonProgressStatus.COMPLETED && lp.completedAt) {
          const lessonInfo = lessonLookup.get(lp.lessonId)
          if (!lessonInfo) continue
          activities.push({
            id: `lp_${lp.id}`,
            studentId,
            studentName: studentNameRef.current,
            courseId: lessonInfo.courseId,
            courseTitle: lessonInfo.courseTitle,
            type: 'lesson_completion',
            title: `Concluiu a unidade: ${lessonInfo.title}`,
            timestamp: lp.completedAt.toISOString(),
          })
        }
      }

      const submissionsUseCase = container.get<ListQuestionnaireSubmissionsForTutorUseCase>(
        Register.content.useCase.ListQuestionnaireSubmissionsForTutorUseCase
      )
      console.log('[useStudentActivities] buscando submissões de questionários')
      const { submissions } = await submissionsUseCase.execute({
        tutorId,
        institutionId,
        studentId,
      })
      console.log('[useStudentActivities] submissões encontradas:', submissions.length)

      for (const { submission, questionnaire, course, lessonTitle } of submissions) {
        activities.push({
          id: `qs_${submission.id}`,
          studentId,
          studentName: studentNameRef.current,
          courseId: course.id,
          courseTitle: course.title,
          type: 'questionnaire_submission',
          title: `Enviou o questionário: ${questionnaire.title || (lessonTitle ? `Questionário de ${lessonTitle}` : 'Questionário')}`,
          timestamp: submission.completedAt.toISOString(),
          score: submission.score,
        })
      }

      activities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      console.log('[useStudentActivities] total atividades:', activities.length)
      setState({ activities, loading: false, error: null })
    } catch (error) {
      console.error('[useStudentActivities] erro:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar atividades',
      }))
    }
  }, [studentId, tutorId, institutionId])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return { ...state }
}
