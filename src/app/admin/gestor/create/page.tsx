'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loader'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { UserAssociationForm, type UserOption, type InstitutionOption, type CourseOption } from '@/components/admin/UserAssociationForm'
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
          onUserChange={setSelectedGestorId}
          onInstitutionChange={setSelectedInstitutionId}
          onCourseAdd={handleCourseAdd}
          onCourseRemove={handleCourseRemove}
          isSubmitting={isSubmitting}
          isEditMode={false}
          userLabel="Gestor de Conteúdo"
          userPlaceholder="Selecione um gestor de conteúdo"
          title="Associar Gestor de Conteúdo a Cursos"
          description="Selecione um gestor de conteúdo e um ou mais cursos para associá-lo"
          backUrl="/admin/gestor"
          onSubmit={handleSubmit}
          loading={loading}
        />
      </DashboardLayout>
    </ProtectedContent>
  )
}
