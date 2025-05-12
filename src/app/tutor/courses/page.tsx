'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'

type CourseWithUIProps = {
  id: string
  title: string
  description: string
  instructor?: string
  duration?: string
  enrolledStudents?: number
  status: 'active' | 'inactive'
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<CourseWithUIProps[]>([])
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true)

        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        )

        const institutionsList = await institutionRepository.list()

        const institutionsForDropdown = institutionsList.map((institution: Institution) => ({
          id: institution.id,
          name: institution.name
        }))

        setInstitutions(institutionsForDropdown)

        if (institutionsForDropdown.length > 0) {
          setSelectedInstitutionId(institutionsForDropdown[0].id)
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching institutions:', err)
        setError('Failed to load institutions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchInstitutions()
  }, [])


  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedInstitutionId) return

      try {
        setLoading(true)

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )

        const coursesList = await courseRepository.listByInstitution(selectedInstitutionId)

        const coursesWithUIProps: CourseWithUIProps[] = coursesList.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: 'Not specified',
          duration: 'Not specified',
          enrolledStudents: 0,
          status: 'active' 
        }))

        setCourses(coursesWithUIProps)
        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [selectedInstitutionId])


  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || course.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <ProtectedContent>
      <DashboardLayout>

        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Meus Cursos</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cursos</CardTitle>
              <CardDescription>
                Gerencie os cursos que você é responsável como tutor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    id="search-courses"
                    type="text"
                    placeholder="Buscar por título, descrição ou instrutor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex-1">
                  <select
                    value={selectedInstitutionId}
                    onChange={(e) => setSelectedInstitutionId(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  >
                    <option value="">Selecione uma instituição</option>
                    {institutions.map(institution => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                    <TabsList>
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="active">Ativos</TabsTrigger>
                      <TabsTrigger value="inactive">Inativos</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {loading && (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-200"></div>
                    <div className="mt-4 text-gray-500">Carregando...</div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Erro!</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              )}

              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Alunos matriculados:</span>
                            <span>{course.enrolledStudents || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${course.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                              {course.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>

                          <div className="pt-4 flex justify-end">
                            <Link href={`/tutor/courses/edit/${course.id}`}>
                              <Button className="border bg-transparent hover:bg-gray-100 text-xs px-3 py-1">Editar</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredCourses.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Nenhum curso encontrado com os critérios de busca atuais.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
