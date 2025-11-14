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

export default function AssociateTutorToCoursePage() {
  const router = useRouter()
  const params = useParams()
  const action = params.action as string
  
  // Determine if we're in edit mode (action is a tutor ID) or create mode (action is "create")
  const isEditMode = action !== 'create'
  const tutorId = isEditMode ? action : ''

  const [tutors, setTutors] = useState<UserOption[]>([])
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])

  const [selectedTutorId, setSelectedTutorId] = useState<string>('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [selectedCourses, setSelectedCourses] = useState<CourseOption[]>([])
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
        if (isEditMode && tutorId) {
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
  }, [tutorId, isEditMode])

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
        if (!isEditMode) {
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
          users={tutors}
          institutions={institutions}
          courses={courses}
          selectedUserId={selectedTutorId}
          selectedInstitutionId={selectedInstitutionId}
          selectedCourses={selectedCourses}
          onUserChange={(tutorId) => {
            if (!isEditMode) {
              setSelectedTutorId(tutorId)
            }
          }}
          onInstitutionChange={(institutionId) => {
            if (!isEditMode) {
              setSelectedInstitutionId(institutionId)
            }
          }}
          onCourseAdd={handleCourseAdd}
          onCourseRemove={handleCourseRemove}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          userLabel="Tutor"
          userPlaceholder="Selecione um tutor"
          title={isEditMode ? 'Editar Associações do Tutor' : 'Associar Tutor a Cursos'}
          description={isEditMode 
            ? 'Edite as associações de cursos para este tutor' 
            : 'Selecione um tutor e um ou mais cursos para associá-lo'
          }
          backUrl="/admin/tutor"
          onSubmit={handleSubmit}
          loading={loading}
        />
      </DashboardLayout>
    </ProtectedContent>
  )
}
