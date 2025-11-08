'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { SelectComponent } from '@/components/select/select'
import { Tabs, TabsList } from '@/components/ui/tabs/tabs'
import { TabsTrigger } from '@/components/tabs/TabsTrigger'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { Institution } from '@/_core/modules/institution'
import { showToast } from '@/components/toast'
import { ListInstitutionsUseCase } from '@/_core/modules/institution/core/use-cases/list-institutions/list-institutions.use-case'
import { ListCoursesByInstitutionUseCase, ListCoursesByInstitutionInput } from '@/_core/modules/content/core/use-cases/list-courses-by-institution'
import { ListCourseTutorsUseCase, ListCourseTutorsInput } from '@/_core/modules/content/core/use-cases/list-course-tutors'
import { GetUserByIdUseCase, GetUserByIdInput } from '@/_core/modules/user/core/use-cases/get-user-by-id'
import { ListEnrollmentsUseCase } from '@/_core/modules/enrollment/core/use-cases/list-enrollments/list-enrollments.use-case'
import type { Course } from '@/_core/modules/content/core/entities/Course'
import { EnrollmentStatus } from '@/_core/modules/enrollment/core/entities/EnrollmentStatus'
import { UserRole } from '@/_core/modules/user/core/entities/User'


type CourseWithUIProps = {
  id: string
  title: string
  description: string
  instructorDisplay?: string
  contentManagerDisplay?: string
  enrolledStudents?: number
  status: 'active' | 'inactive'
}

const NAME_COLUMNS = [
  'Nome',
  'Descrição',
  'Instrutor',
  'Gestores',
  'Estudantes',
  'Status',
  'Ação'
]

export default function CoursesPage() {
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

        const listInstitutionsUseCase = container.get<ListInstitutionsUseCase>(
          Register.institution.useCase.ListInstitutionsUseCase
        )
        
        const result = await listInstitutionsUseCase.execute({})
        
        const institutionsForDropdown = result.institutions.map((institution: Institution) => ({
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
        const errorMessage = 'Falha ao carregar instituições. Tente novamente.'
        setError(errorMessage)
        showToast.error(errorMessage)
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

        const listCoursesByInstitutionUseCase = container.get<ListCoursesByInstitutionUseCase>(
          Register.content.useCase.ListCoursesByInstitutionUseCase
        )
        
        const coursesResult = await listCoursesByInstitutionUseCase.execute(
          new ListCoursesByInstitutionInput(selectedInstitutionId)
        )
        
        const listCourseTutorsUseCase = container.get<ListCourseTutorsUseCase>(
          Register.content.useCase.ListCourseTutorsUseCase
        )
        
        const getUserByIdUseCase = container.get<GetUserByIdUseCase>(
          Register.user.useCase.GetUserByIdUseCase
        )
        
        const listEnrollmentsUseCase = container.get<ListEnrollmentsUseCase>(
          Register.enrollment.useCase.ListEnrollmentsUseCase
        )
        
        // Create an array of promises to fetch tutors, content managers and enrollments for each course
        const coursesWithDetailsPromises = coursesResult.courses.map(async (course: Course) => {
          // Get all user associations for this course (tutors and content managers)
          const courseTutorsResult = await listCourseTutorsUseCase.execute(
            new ListCourseTutorsInput(course.id)
          )
          
          // Get user details for each association
          const userPromises = courseTutorsResult.tutors.map(async (association) => {
            const userResult = await getUserByIdUseCase.execute(new GetUserByIdInput(association.userId))
            return userResult.user ? { 
              id: userResult.user.id, 
              email: userResult.user.email.value,
              role: userResult.user.role 
            } : null
          })
          
          // Wait for all user details to be fetched
          const users = (await Promise.all(userPromises)).filter(user => user !== null)
          
          // Separate tutors from content managers by role
          const tutors = users.filter(user => user.role === UserRole.TUTOR)
          const contentManagers = users.filter(user => user.role === UserRole.CONTENT_MANAGER)
          
          // Determine what to display for instructors (tutors)
          let instructorDisplay = 'Sem instrutor'
          if (tutors.length === 1) {
            instructorDisplay = tutors[0]?.email || 'Sem instrutor'
          } else if (tutors.length > 1) {
            const firstTutor = tutors[0]?.email || 'Tutor'
            const additionalCount = tutors.length - 1
            instructorDisplay = `${firstTutor} +${additionalCount}`
          }
          
          // Determine what to display for content managers
          let contentManagerDisplay = 'Sem gestor'
          if (contentManagers.length === 1) {
            contentManagerDisplay = contentManagers[0]?.email || 'Sem gestor'
          } else if (contentManagers.length > 1) {
            const firstManager = contentManagers[0]?.email || 'Gestor'
            const additionalCount = contentManagers.length - 1
            contentManagerDisplay = `${firstManager} +${additionalCount}`
          }
          
          // Get enrolled students count
          let enrolledStudents = 0
          try {
            const enrollmentsResult = await listEnrollmentsUseCase.execute({
              courseId: course.id,
              status: [EnrollmentStatus.ENROLLED]
            })
            enrolledStudents = enrollmentsResult.enrollments.length
          } catch (error) {
            console.error('Error fetching enrollments for course:', course.id, error)
          }
          
          return {
            id: course.id,
            title: course.title,
            description: course.description,
            instructorDisplay,
            contentManagerDisplay,
            enrolledStudents,
            status: 'active' as 'active' | 'inactive'
          }
        })
        
        // Wait for all courses with details to be processed
        const coursesWithUIProps = await Promise.all(coursesWithDetailsPromises)
        
        setCourses(coursesWithUIProps)
        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        const errorMessage = 'Falha ao carregar cursos. Tente novamente.'
        setError(errorMessage)
        showToast.error(errorMessage)
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
      (course.instructorDisplay && course.instructorDisplay.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Cursos Existentes</h1>
            <Link href="/admin/courses/create">
              <Button variant='primary'>Criar novo curso</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    id="search"
                    type="text"
                    placeholder="Pesquise por nome, descrição ou instrutor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1">
                  <SelectComponent
                    value={selectedInstitutionId}
                    onChange={(value) => setSelectedInstitutionId(value)}
                    options={institutions.map(institution => ({
                      value: institution.id,
                      label: institution.name
                    }))}
                    placeholder="Selecione uma instituição"
                  />
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
            <LoadingSpinner />
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    {NAME_COLUMNS.map(item => (
                      <th className="text-left py-3 px-4" key={item}>{item}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="py-3 px-4">{course.title}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{course.description}</td>
                      <td className="py-3 px-4">{course.instructorDisplay}</td>
                      <td className="py-3 px-4">{course.contentManagerDisplay}</td>
                      <td className="py-3 px-4 text-center">{course.enrolledStudents}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          course.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex  gap-2">
                        <Link href={`/admin/courses/edit/${course.id}`}>
                            <Button variant='primary'>Módulos</Button>
                          </Link>
                          <Link href={`/admin/courses/edit-course/${course.id}`}>
                            <Button variant='secondary'>Editar</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCourses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum curso encontrado 
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
