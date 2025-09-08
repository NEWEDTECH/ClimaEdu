'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository'
import { InstitutionRepository } from '@/_core/modules/institution'
import { Institution } from '@/_core/modules/institution'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import { showToast } from '@/components/toast'


type CourseWithUIProps = {
  id: string
  title: string
  description: string
  instructorDisplay?: string
  enrolledStudents?: number
  status: 'active' | 'inactive'
}

const NAME_COLUMNS = [
  'Nome',
  'Descrição',
  'Instrutor',
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

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )
        
        const coursesList = await courseRepository.listByInstitution(selectedInstitutionId)
        
        // Get course tutors
        const courseTutorRepository = container.get<CourseTutorRepository>(
          Register.content.repository.CourseTutorRepository
        )
        
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )
        
        // Create an array of promises to fetch tutors for each course
        const coursesWithTutorsPromises = coursesList.map(async (course) => {
          // Get all tutor associations for this course
          const tutorAssociations = await courseTutorRepository.findByCourseId(course.id)
          
          // Get user details for each tutor
          const tutorPromises = tutorAssociations.map(async (association) => {
            const user = await userRepository.findById(association.userId)
            return user ? { id: user.id, email: user.email.value } : null
          })
          
          // Wait for all tutor details to be fetched
          const tutors = (await Promise.all(tutorPromises)).filter(tutor => tutor !== null)
          
          // Determine what to display for instructors
          let instructorDisplay = 'Sem instrutor'
          if (tutors.length === 1) {
            // If there's only one tutor, display their email
            instructorDisplay = tutors[0]?.email || 'Sem instrutor'
          } else if (tutors.length > 1) {
            // If there are multiple tutors, display the count
            instructorDisplay = `${tutors.length} instrutores`
          }
          
          return {
            id: course.id,
            title: course.title,
            description: course.description,
            instructorDisplay,
            enrolledStudents: 0,
            status: 'active' as 'active' | 'inactive'
          }
        })
        
        // Wait for all courses with tutors to be processed
        const coursesWithUIProps = await Promise.all(coursesWithTutorsPromises)
        
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
            <Link href="/admin/courses/create-edit">
              <Button className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">Criar novo curso</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cursos</CardTitle>
              <CardDescription>
                Gerencie todos os cursos em sua plataforma educacional
              </CardDescription>
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
                            <Button className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">Módulos</Button>
                          </Link>
                          <Link href={`/admin/courses/create-edit/${course.id}`}>
                            <Button className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">Editar</Button>
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
