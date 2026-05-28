'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card'
import { Button } from '@/components/button'
import { Progress } from '@/components/ui/helpers/progress'
import type { StudentFollowUpData } from '@/hooks/follow-up/useTutorFollowUp'

interface StudentDetailViewProps {
  student: StudentFollowUpData
  onBack: () => void
  onCourseSelect: (courseId: string) => void
}

export function StudentDetailView({
  student,
  onBack,
  onCourseSelect,
}: StudentDetailViewProps) {
  const averageProgress =
    student.enrolledCourses.length > 0
      ? Math.round(
          student.enrolledCourses.reduce((acc, c) => acc + c.progress, 0) /
            student.enrolledCourses.length
        )
      : 0

  const gradesWithValues = student.enrolledCourses.filter(c => c.grade !== null)
  const averageGrade =
    gradesWithValues.length > 0
      ? Math.round(
          gradesWithValues.reduce((acc, c) => acc + (c.grade ?? 0), 0) / gradesWithValues.length
        )
      : null

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
          ← Voltar para lista de alunos
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
            <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cursos Matriculados</p>
                <p className="text-3xl font-bold">{student.enrolledCourses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Progresso Médio</p>
                <p className="text-3xl font-bold">{averageProgress}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nota Média</p>
                <p className="text-3xl font-bold">
                  {averageGrade !== null ? `${averageGrade}%` : '—'}
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
          <CardTitle>Cursos Matriculados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {student.enrolledCourses.map(course => (
              <div
                key={course.id}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onCourseSelect(course.id)}
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{course.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      course.progress === 100
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    {course.progress === 100 ? 'Concluído' : 'Em andamento'}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Unidades: {course.completedLessons}/{course.totalLessons}</span>
                  {course.grade !== null && <span>Nota: {course.grade}%</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </>
  )
}
