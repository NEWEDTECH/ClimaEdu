'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/loader'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { UserAssociationForm, type UserOption, type InstitutionOption, type CourseOption } from '@/components/admin/UserAssociationForm'
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

export default function EditGestorCoursesPage() {
  const router = useRouter()
  const params = useParams()
  const gestorId = params.id as string

  const [gestores, setGestores] = useState<UserOption[]>([])
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])

  const [selectedGestorId, setSelectedGestorId] = useState<string>('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [selectedCourses, setSelectedCourses] = useState<CourseOption[]>([])
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

        // Fetch gestor data and courses
        if (gestorId) {
          // Get gestor data
          const gestor = await userRepository.findById(gestorId)

          if (gestor) {
            setSelectedGestorId(gestor.id)

            // Get gestor's institution using the ListUserInstitutionsUseCase
            const listUserInstitutionsUseCase = container.get<ListUserInstitutionsUseCase>(
              Register.institution.useCase.ListUserInstitutionsUseCase
            )

            const userInstitutionsResult = await listUserInstitutionsUseCase.execute({
              userId: gestor.id
            })

            let gestorInstitutionId: string | undefined

            // Get the first institution (assuming gestor belongs to one institution)
            if (userInstitutionsResult.institutions.length > 0) {
              gestorInstitutionId = userInstitutionsResult.institutions[0].id
            }

            const courseTutorRepository = container.get<CourseTutorRepository>(
              Register.content.repository.CourseTutorRepository
            )

            const courseRepository = container.get<CourseRepository>(
              Register.content.repository.CourseRepository
            )

            // Get gestor's courses (using the same association table)
            const courseTutors = await courseTutorRepository.findByUserId(gestor.id)

            if (courseTutors.length > 0) {
              // Get course details for each association
              const courseDetailsPromises = courseTutors.map(async (courseTutor) => {
                const course = await courseRepository.findById(courseTutor.courseId)
                if (course) {
                  // If gestor doesn't have institutionId directly, get it from first course
                  if (!gestorInstitutionId) {
                    gestorInstitutionId = course.institutionId
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

              // Set the gestor's institution
              if (gestorInstitutionId) {
                setSelectedInstitutionId(gestorInstitutionId)

                // Load all courses from gestor's institution
                const institutionCourses = await courseRepository.listByInstitution(gestorInstitutionId)
                setCourses(institutionCourses.map(c => ({
                  id: c.id,
                  title: c.title
                })))
              }

              // Set courses that gestor is already managing
              setSelectedCourses(courseDetails)
            } else {
              // If gestor has no courses yet, try to get institution from gestor directly
              if (gestorInstitutionId) {
                setSelectedInstitutionId(gestorInstitutionId)

                // Load all courses from gestor's institution
                const institutionCourses = await courseRepository.listByInstitution(gestorInstitutionId)
                setCourses(institutionCourses.map(c => ({
                  id: c.id,
                  title: c.title
                })))
              }
            }
          } else {
            setError('Gestor de conteúdo não encontrado')
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
  }, [gestorId, selectedInstitutionId])

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

  const handleCourseAdd = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (course && !selectedCourses.some(c => c.id === courseId)) {
      setSelectedCourses(prev => [...prev, course])
    }
  }

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

      const courseTutorRepository = container.get<CourseTutorRepository>(
        Register.content.repository.CourseTutorRepository
      )

      // Get current course-gestor associations
      const currentCourseTutors = await courseTutorRepository.findByUserId(selectedGestorId)

      // Identify courses to add and remove
      const selectedCourseIds = selectedCourses.map(course => course.id)
      const currentCourseIds = currentCourseTutors.map(ct => ct.courseId)

      // Courses to add: in selectedCourseIds but not in currentCourseIds
      const coursesToAdd = selectedCourseIds.filter(id => !currentCourseIds.includes(id))

      // Courses to remove: in currentCourseIds but not in selectedCourseIds
      const coursesToRemove = currentCourseTutors.filter(ct => !selectedCourseIds.includes(ct.courseId))

      // Add new associations (using the same UseCase since it's the same table)
      const addPromises = coursesToAdd.map(courseId =>
        associateTutorToCourseUseCase.execute({
          userId: selectedGestorId,
          courseId
        })
      )

      // Remove old associations
      const removePromises = coursesToRemove.map(ct =>
        courseTutorRepository.delete(ct.id)
      )

      // Execute all operations
      await Promise.all([...addPromises, ...removePromises])

      setSuccessMessage('Associações do gestor de conteúdo atualizadas com sucesso')

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/gestor')
      }, 2000)
    } catch (err) {
      console.error('Error updating gestor associations:', err)
      setError('Falha ao atualizar associações do gestor de conteúdo. Por favor, tente novamente mais tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <LoadingSpinner />
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  if (successMessage) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Sucesso!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <UserAssociationForm
          users={gestores}
          institutions={institutions}
          courses={courses}
          selectedUserId={selectedGestorId}
          selectedInstitutionId={selectedInstitutionId}
          selectedCourses={selectedCourses}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onUserChange={(gestorId) => {
            // Don't change in edit mode
          }}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onInstitutionChange={(institutionId) => {
            // Don't change in edit mode
          }}
          onCourseAdd={handleCourseAdd}
          onCourseRemove={handleCourseRemove}
          isSubmitting={isSubmitting}
          isEditMode={true}
          userLabel="Gestor de Conteúdo"
          userPlaceholder="Selecione um gestor de conteúdo"
          title="Editar Associações do Gestor de Conteúdo"
          description="Edite as associações de cursos para este gestor de conteúdo"
          backUrl="/admin/gestor"
          onSubmit={handleSubmit}
          loading={loading}
        />
      </DashboardLayout>
    </ProtectedContent>
  )
}
