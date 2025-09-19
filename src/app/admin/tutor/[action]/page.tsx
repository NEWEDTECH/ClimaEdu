'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'
import { AssociateTutorToCourseUseCase } from '@/_core/modules/content/core/use-cases/associate-tutor-to-course/associate-tutor-to-course.use-case'
import { ListUserInstitutionsUseCase } from '@/_core/modules/institution/core/use-cases/list-user-institutions/list-user-institutions.use-case'

export default function AssociateTutorToCoursePage() {
  const router = useRouter()
  const params = useParams()
  const tutorId = params.action as string

  const [tutors, setTutors] = useState<Array<{ id: string, name: string, email: string }>>([])
  const [institutions, setInstitutions] = useState<Array<{ id: string, name: string }>>([])
  const [courses, setCourses] = useState<Array<{ id: string, title: string }>>([])

  const [selectedTutorId, setSelectedTutorId] = useState<string>('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [selectedCourses, setSelectedCourses] = useState<Array<{ id: string, title: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch tutors and institutions on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)

        // Fetch tutors
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )

        const tutorsList = await userRepository.listByType(UserRole.TUTOR)

        const tutorsForDropdown = tutorsList.map(tutor => ({
          id: tutor.id,
          name: tutor.name,
          email: tutor.email.value
        }))

        setTutors(tutorsForDropdown)

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

        // If in edit mode, fetch tutor data and courses
        if (tutorId) {
          // Get tutor data
          const tutor = await userRepository.findById(tutorId)

          if (tutor) {
            setSelectedTutorId(tutor.id)

            // Get tutor's institution using the ListUserInstitutionsUseCase
            const listUserInstitutionsUseCase = container.get<ListUserInstitutionsUseCase>(
              Register.institution.useCase.ListUserInstitutionsUseCase
            )

            const userInstitutionsResult = await listUserInstitutionsUseCase.execute({
              userId: tutor.id
            })

            let tutorInstitutionId: string | undefined

            // Get the first institution (assuming tutor belongs to one institution)
            if (userInstitutionsResult.institutions.length > 0) {
              tutorInstitutionId = userInstitutionsResult.institutions[0].id
            }

            const courseTutorRepository = container.get<CourseTutorRepository>(
              Register.content.repository.CourseTutorRepository
            )

            const courseRepository = container.get<CourseRepository>(
              Register.content.repository.CourseRepository
            )

            // Get tutor's courses
            const courseTutors = await courseTutorRepository.findByUserId(tutor.id)

            if (courseTutors.length > 0) {
              // Get course details for each association
              const courseDetailsPromises = courseTutors.map(async (courseTutor) => {
                const course = await courseRepository.findById(courseTutor.courseId)
                if (course) {
                  // If tutor doesn't have institutionId directly, get it from first course
                  if (!tutorInstitutionId) {
                    tutorInstitutionId = course.institutionId
                  }

                  return {
                    id: course.id,
                    title: course.title
                  }
                }
                return null
              })

              const courseDetails = (await Promise.all(courseDetailsPromises)).filter(
                (course): course is { id: string; title: string } =>
                  course !== null
              )

              // Set the tutor's institution
              if (tutorInstitutionId) {
                setSelectedInstitutionId(tutorInstitutionId)

                // Load all courses from tutor's institution
                const institutionCourses = await courseRepository.listByInstitution(tutorInstitutionId)
                setCourses(institutionCourses.map(c => ({
                  id: c.id,
                  title: c.title
                })))
              }

              // Set courses that tutor is already teaching
              setSelectedCourses(courseDetails)
            } else {
              // If tutor has no courses yet, try to get institution from tutor directly
              if (tutorInstitutionId) {
                setSelectedInstitutionId(tutorInstitutionId)

                // Load all courses from tutor's institution
                const institutionCourses = await courseRepository.listByInstitution(tutorInstitutionId)
                setCourses(institutionCourses.map(c => ({
                  id: c.id,
                  title: c.title
                })))
              }
            }
          } else {
            setError('Tutor não encontrado')
          }
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching initial data:', err)
        setError('Falha ao carregar dados. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()

    // Add click event listener to handle clicks outside dropdowns
  }, [tutorId, selectedInstitutionId])

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

        // Only reset selected courses if not in edit mode
        if (!tutorId) {
          setSelectedCourses([])
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Falha ao carregar cursos. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [selectedInstitutionId, tutorId])


  const handleCourseRemove = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(course => course.id !== courseId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTutorId) {
      setError('Por favor, selecione um tutor')
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

      const courseTutorRepository = container.get<CourseTutorRepository>(
        Register.content.repository.CourseTutorRepository
      )

      // Get current course-tutor associations
      const currentCourseTutors = await courseTutorRepository.findByUserId(selectedTutorId)

      // Identify courses to add and remove
      const selectedCourseIds = selectedCourses.map(course => course.id)
      const currentCourseIds = currentCourseTutors.map(ct => ct.courseId)

      // Courses to add: in selectedCourseIds but not in currentCourseIds
      const coursesToAdd = selectedCourseIds.filter(id => !currentCourseIds.includes(id))

      // Courses to remove: in currentCourseIds but not in selectedCourseIds
      const coursesToRemove = currentCourseTutors.filter(ct => !selectedCourseIds.includes(ct.courseId))

      // Add new associations
      const addPromises = coursesToAdd.map(courseId =>
        associateTutorToCourseUseCase.execute({
          userId: selectedTutorId,
          courseId
        })
      )

      // Remove old associations
      const removePromises = coursesToRemove.map(ct =>
        courseTutorRepository.delete(ct.id)
      )

      // Execute all operations
      await Promise.all([...addPromises, ...removePromises])

      setSuccessMessage('Associações do tutor atualizadas com sucesso')

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/tutor')
      }, 2000)
    } catch (err) {
      console.error('Error updating tutor associations:', err)
      setError('Falha ao atualizar associações do tutor. Por favor, tente novamente mais tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {tutorId ? 'Editar Associações do Tutor' : 'Associar Tutor a Cursos'}
            </h1>
            <Link href="/admin/tutor">
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
                <CardTitle>
                  {tutorId ? 'Editar Associações do Tutor' : 'Associar Tutor a Cursos'}
                </CardTitle>
                <CardDescription>
                  {tutorId
                    ? 'Edite as associações de cursos para este tutor'
                    : 'Selecione um tutor e um ou mais cursos para associá-lo'
                  }
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
                      if (!tutorId) {
                        const selectedInstitution = institutions.find(i => i.id === institutionId)
                        if (selectedInstitution) {
                          setSelectedInstitutionId(selectedInstitution.id)
                        }
                      }
                    }}
                    options={institutions.map(institution => ({
                      value: institution.id,
                      label: institution.name
                    }))}
                    placeholder="Selecione uma instituição"
                    className={`${tutorId ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
                  />
                  {tutorId && (
                    <p className="text-xs text-gray-500">
                      Instituição definida automaticamente baseada nos cursos do tutor
                    </p>
                  )}
                </div>

                {/* Tutor Selection */}
                <div className="space-y-2">
                  <label htmlFor="tutor" className="text-sm font-medium">
                    Selecionar Tutor
                  </label>
                  <SelectComponent
                    value={selectedTutorId}
                    onChange={(tutorId) => {
                      if (!tutorId) {
                        const selectedTutor = tutors.find(t => t.id === tutorId)
                        if (selectedTutor) {
                          setSelectedTutorId(selectedTutor.id)
                        }
                      }
                    }}
                    options={tutors.map(tutor => ({
                      value: tutor.id,
                      label: `${tutor.name} (${tutor.email})`
                    }))}
                    placeholder="Selecione um tutor"
                    className={`${tutorId ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
                  />

                  {tutorId && (
                    <p className="text-xs text-gray-500">
                      Tutor não pode ser alterado no modo de edição
                    </p>
                  )}
                </div>



                {/* Course Autocomplete with Tooltips */}
                <div className="space-y-2">
                  <label htmlFor="course" className="text-sm font-medium">
                    Selecionar Cursos
                  </label>

                  {/* Selected Courses List */}
                  {selectedCourses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-3">Cursos Selecionados ({selectedCourses.length})</h4>
                      <div
                        className={`space-y-2 ${selectedCourses.length >= 5
                          ? 'max-h-96 overflow-y-scroll border border-gray-200 rounded-lg p-2 bg-gray-50'
                          : ''
                          }`}
                        style={selectedCourses.length >= 5 ? { maxHeight: '400px' } : {}}
                      >
                        {selectedCourses.map((course) => (
                          <div key={course.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{course.title}</div>
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

                  {!selectedInstitutionId && !tutorId && (
                    <p className="text-sm text-gray-500">
                      Por favor, selecione uma instituição para ver os cursos
                    </p>
                  )}
                </div>



              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href="/admin/tutor">
                  <Button variant='secondary' type="button">Cancelar</Button>
                </Link>
                <Button
                  variant='primary'
                  type="submit"
                  disabled={isSubmitting || loading}>
                  {isSubmitting
                    ? (tutorId ? 'Salvando...' : 'Associando...')
                    : (tutorId ? 'Salvar' : 'Associar Tutor a Cursos')
                  }
                </Button>
              </CardFooter>
            </FormSection>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
