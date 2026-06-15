'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card/card'
import { Button } from '@/components/button'
import { Progress } from '@/components/ui/helpers/progress'
import { Pagination } from '@/components/pagination/Pagination'
import type { StudentFollowUpData } from '@/hooks/follow-up/useTutorFollowUp'
import type { Course } from '@/_core/modules/content'

const ITEMS_PER_PAGE = 6

interface StudentAvatarProps {
  name: string
  avatarUrl: string | null
}

function StudentAvatar({ name, avatarUrl }: StudentAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-10 h-10 rounded-full mr-3 object-cover"
      />
    )
  }
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full mr-3 bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      {initials}
    </div>
  )
}

interface StudentListViewProps {
  students: StudentFollowUpData[]
  courses: Course[]
  loading: boolean
  error: string | null
  searchTerm: string
  filterCourse: string | null
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFilterChange: (courseId: string | null) => void
  onStudentSelect: (studentId: string) => void
}

export function StudentListView({
  students,
  courses,
  loading,
  error,
  searchTerm,
  filterCourse,
  onSearchChange,
  onFilterChange,
  onStudentSelect,
}: StudentListViewProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const uniqueCourses = courses.map(c => c.title)

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse =
      filterCourse === null ||
      student.enrolledCourses.some(c => c.title === filterCourse)
    return matchesSearch && matchesCourse
  })

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Volta para página 1 sempre que filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCourse])

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">Acompanhamento Individual</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Monitore o progresso e desempenho dos seus alunos
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar aluno por nome ou email..."
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            value={filterCourse || ''}
            onChange={e => onFilterChange(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">Todos os cursos</option>
            {uniqueCourses.map((course, index) => (
              <option key={index} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {paginatedStudents.map(student => (
              <Card
                key={student.id}
                className="transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} />
                    <div>
                      <div>{student.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                        {student.email}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.enrolledCourses.map(course => (
                      <div key={course.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{course.title}</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {course.lastActivity
                              ? `Última atividade: ${new Date(course.lastActivity).toLocaleDateString('pt-BR')}`
                              : 'Sem atividade registrada'}
                          </span>
                          {course.grade !== null && <span>Nota: {course.grade}%</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={e => {
                      e.stopPropagation()
                      onStudentSelect(student.id)
                    }}
                  >
                    Ver detalhes
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          {filteredStudents.length === 0 && students.length > 0 && (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">Nenhum aluno encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Tente ajustar os filtros ou termos de busca.
              </p>
            </div>
          )}

          {students.length === 0 && (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">Nenhum aluno encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Você ainda não possui alunos matriculados nos seus cursos.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
