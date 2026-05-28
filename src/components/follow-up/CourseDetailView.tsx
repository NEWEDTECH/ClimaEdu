'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card'
import { Button } from '@/components/button'
import { Progress } from '@/components/ui/helpers/progress'
import { ActivityFeed } from './ActivityFeed'
import type { StudentFollowUpData, StudentCourseData } from '@/hooks/follow-up/useTutorFollowUp'
import type { ActivityItem } from '@/hooks/follow-up/useStudentActivities'

interface CourseDetailViewProps {
  student: StudentFollowUpData
  course: StudentCourseData
  activities: ActivityItem[]
  activitiesLoading: boolean
  activitiesError: string | null
  onBack: () => void
}

export function CourseDetailView({
  student,
  course,
  activities,
  activitiesLoading,
  activitiesError,
  onBack,
}: CourseDetailViewProps) {
  const [feedbackText, setFeedbackText] = useState('')

  const courseActivities = activities.filter(a => a.courseId === course.id)

  const avatarSrc = student.avatarUrl
  const initials = student.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Voltar para detalhes do aluno
        </Button>
        <div className="flex items-center mb-4">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={student.name}
              className="w-16 h-16 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full mr-4 bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{course.title}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Progresso</p>
                <p className="text-3xl font-bold">{course.progress}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unidades Concluídas</p>
                <p className="text-3xl font-bold">
                  {course.completedLessons}/{course.totalLessons}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nota</p>
                <p className="text-3xl font-bold">
                  {course.grade !== null ? `${course.grade}%` : '—'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progresso no Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso geral</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Atividades no Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            activities={courseActivities}
            loading={activitiesLoading}
            error={activitiesError}
            showCourse={false}
            emptyMessage="Nenhuma atividade registrada para este curso."
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[150px]"
              placeholder="Escreva um feedback para o aluno sobre seu desempenho neste curso..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
            />
            <Button className="mt-4">Enviar Feedback</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Agendar Videoconferência
              </Button>
              <Button variant="ghost" className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Gerar Relatório Detalhado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
