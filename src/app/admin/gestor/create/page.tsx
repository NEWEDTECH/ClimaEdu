'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/button'
import { SelectComponent } from '@/components/select'
import { FormSection } from '@/components/form/form'
import { LoadingSpinner } from '@/components/loader'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'
import { AssociateTutorToCourseUseCase } from '@/_core/modules/content/core/use-cases/associate-tutor-to-course/associate-tutor-to-course.use-case'

export default function CreateGestorCoursesPage() {
  const router = useRouter()

  const [gestores, setGestores] = useState<Array<{ id: string, name: string, email: string }>>([])
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [courses, setCourses] = useState<Array<{ id: string, title: string }>>([])

  const [selectedGestorId, setSelectedGestorId] = useState<string>('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [selectedCourses, setSelectedCourses] = useState<Array<{ id: string, title: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch gestores and institutions on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)

        // Fetch content managers
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )

        const gestoresList = await userRepository.listByType(UserRole.CONTENT_MANAGER)

        const gestoresForDropdown = gestoresList.map(gestor => ({
          id: gestor.id,
          name: gestor.name,
          email: gestor.email.value
        }))

        setGestores(gestoresForDropdown)

        // Fetch institutions
        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        )

        const institutionsList = await institutionRepository.list()

        const institutionsForDropdown = institutionsList.map((institution: Institution) => ({
          id: institution.id,
          name: institution.name
        }))

        setInstitutions(institutionsForDropdown)

        setError(null)
      } catch (err) {
        console.error('Error fetching initial data:', err)
        setError('Falha ao carregar dados. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch courses when institution changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedInstitutionId) return

      try {
        setLoading(true)

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )

        const coursesList = await courseRepository.listByInstitution(selectedInstitutionId)

        const coursesForDropdown = coursesList.map(course => ({
          id: course.id,
          title: course.title
        }))

        setCourses(coursesForDropdown)

        // Reset selected courses when institution changes
        setSelectedCourses([])

        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Falha ao carregar cursos. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [selectedInstitutionId])

  const handleCourseRemove = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(course => course.id !== courseId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedGestorId) {
      setError('Por favor, selecione um gestor de conteúdo')
      return
    }

    if (!selectedInstitutionId) {
      setError('Por favor, selecione uma instituição')
      return
    }

    if (selectedCourses.length === 0) {
      setError('Por favor, selecione pelo menos um curso')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const associateTutorToCourseUseCase = container.get<AssociateTutorToCourseUseCase>(
        Register.content.useCase.AssociateTutorToCourseUseCase
      )

      // Associate gestor to all selected courses (using the same UseCase)
      const promises = selectedCourses.map(course =>
        associateTutorToCourseUseCase.execute({
          userId: selectedGestorId,
          courseId: course.id
        })
      )

      await Promise.all(promises)

      setSuccessMessage('Gestor de conteúdo associado aos cursos com sucesso')

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/gestor')
      }, 2000)
    } catch (err) {
      console.error('Error associating gestor to courses:', err)
      setError('Falha ao associar gestor aos cursos. Por favor, tente novamente mais tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Associar Gestor de Conteúdo a Cursos</h1>
            <Link href="/admin/gestor">
              <Button variant='primary'>Voltar</Button>
            </Link>
          </div>

          {loading && <LoadingSpinner />}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Sucesso!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}

          <Card>
            <FormSection onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Associar Gestor de Conteúdo a Cursos</CardTitle>
                <CardDescription>
                  Selecione um gestor de conteúdo e um ou mais cursos para associá-lo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Institution Selection */}
                <div className="space-y-2">
                  <label htmlFor="institution" className="text-sm font-medium">
                    Selecionar Instituição
                  </label>
                  <SelectComponent
                    value={selectedInstitutionId}
                    onChange={(institutionId) => {
                      const selectedInstitution = institutions.find(i => i.id === institutionId)
                      if (selectedInstitution) {
                        setSelectedInstitutionId(selectedInstitution.id)
                      }
                    }}
                    options={institutions.map(institution => ({
                      value: institution.id,
                      label: institution.name
                    }))}
                    placeholder="Selecione uma instituição"
                    className="cursor-pointer"
                  />
                </div>

                {/* Gestor Selection */}
                <div className="space-y-2">
                  <label htmlFor="gestor" className="text-sm font-medium">
                    Selecionar Gestor de Conteúdo
                  </label>
                  <SelectComponent
                    value={selectedGestorId}
                    onChange={(selectedGestorIdValue) => {
                      const selectedGestor = gestores.find(g => g.id === selectedGestorIdValue)
                      if (selectedGestor) {
                        setSelectedGestorId(selectedGestor.id)
                      }
                    }}
                    options={gestores.map(gestor => ({
                      value: gestor.id,
                      label: `${gestor.name} (${gestor.email})`
                    }))}
                    placeholder="Selecione um gestor de conteúdo"
                    className="cursor-pointer"
                  />
                </div>

                {/* Course Autocomplete */}
                <div className="space-y-2">
                  <label htmlFor="course" className="text-sm font-medium">
                    Selecionar Cursos
                  </label>

                  {/* Selected Courses List */}
                  {selectedCourses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-3">Cursos Selecionados ({selectedCourses.length})</h4>
                      <div
                        className={`space-y-2 dark:bg-dark ${selectedCourses.length >= 5
                          ? 'max-h-96 overflow-y-scroll border border-gray-200 rounded-lg p-2'
                          : ''
                          }`}
                        style={selectedCourses.length >= 5 ? { maxHeight: '400px' } : {}}
                      >
                        {selectedCourses.map((course) => (
                          <div key={course.id} className="flex items-center gap-3 p-3 border border-blue-200 dark:border-white dark:bg-dark rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleCourseRemove(course.id)}
                              className="bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 flex items-center gap-1 whitespace-nowrap min-w-fit"
                              aria-label="Remover curso"
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <SelectComponent
                      value=""
                      onChange={(courseId) => {
                        const selectedCourse = courses.find(c => c.id === courseId)
                        if (selectedCourse && !selectedCourses.some(c => c.id === courseId)) {
                          setSelectedCourses(prev => [...prev, selectedCourse])
                        }
                      }}
                      options={selectedInstitutionId ? courses
                        .filter(course => !selectedCourses.some(selected => selected.id === course.id))
                        .map(course => ({
                          value: course.id,
                          label: course.title
                        })) : []}
                      placeholder={selectedInstitutionId ? "Selecione um curso para adicionar" : "Selecione uma instituição primeiro"}
                    />
                  </div>

                  {courses.length === 0 && selectedInstitutionId && (
                    <p className="text-sm text-gray-500">
                      Nenhum curso disponível para a instituição selecionada
                    </p>
                  )}

                  {!selectedInstitutionId && (
                    <p className="text-sm text-gray-500">
                      Por favor, selecione uma instituição para ver os cursos
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href="/admin/gestor">
                  <Button variant='secondary' type="button">Cancelar</Button>
                </Link>
                <Button
                  variant='primary'
                  type="submit"
                  disabled={isSubmitting || loading}>
                  {isSubmitting ? 'Associando...' : 'Associar Gestor a Cursos'}
                </Button>
              </CardFooter>
            </FormSection>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
