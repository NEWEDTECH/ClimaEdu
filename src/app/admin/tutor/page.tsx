'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { LoadingSpinner } from '@/components/loader'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'

type TutorWithDetails = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  joinDate: string;
  courses: {
    count: number;
    name?: string;
  };
}

export default function TutorPage() {
  const [tutors, setTutors] = useState<TutorWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch tutors and their details
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true)
        
        // Get repositories
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        )
        
        const courseTutorRepository = container.get<CourseTutorRepository>(
          Register.content.repository.CourseTutorRepository
        )
        
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )
        
        // Fetch all tutors
        const tutorsList = await userRepository.listByType(UserRole.TUTOR)
        
        // For each tutor, get their courses
        const tutorsWithDetails = await Promise.all(
          tutorsList.map(async (tutor) => {
            // Get course-tutor associations for this tutor
            const courseTutors = await courseTutorRepository.findByUserId(tutor.id)
            
            // Initialize courses info
            const coursesInfo = {
              count: 0,
              name: undefined as string | undefined
            }
            
            if (courseTutors.length > 0) {
              // Get course details for each association
              const courseDetailsPromises = courseTutors.map(async (courseTutor) => {
                const course = await courseRepository.findById(courseTutor.courseId)
                if (course) {
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
              
              coursesInfo.count = courseDetails.length
              
              // If there's exactly one course, get its name
              if (courseDetails.length === 1) {
                coursesInfo.name = courseDetails[0].title
              }
            }
            
            // Return tutor with details
            return {
              id: tutor.id,
              name: tutor.name,
              email: tutor.email.value,
              status: 'active' as 'active' | 'inactive', 
              joinDate: tutor.createdAt.toISOString().split('T')[0], 
              courses: coursesInfo
            }
          })
        )
        
        setTutors(tutorsWithDetails)
        setError(null)
      } catch (err) {
        console.error('Error fetching tutors:', err)
        setError('Falha ao carregar tutores. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTutors()
  }, [])
  
  // Filter tutors based on search term and status
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = 
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Configuração do tutor</h1>
            <Link href="/admin/tutor/create">
              <Button>Adicionar tutor a um curso</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tutores</CardTitle>
              <CardDescription>
                Gerencie todos os tutores na sua plataforma educacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    id="search-tutors"
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex space-x-1 rounded-md bg-muted p-1">
                    <Button
                      className={`px-3 py-1.5 text-sm font-medium rounded-sm ${
                        statusFilter === 'all' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                      }`}
                      onClick={() => setStatusFilter('all')}
                    >
                      Todos
                    </Button>
                    <Button
                      className={`px-3 py-1.5 text-sm font-medium rounded-sm ${
                        statusFilter === 'active' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                      }`}
                      onClick={() => setStatusFilter('active')}
                    >
                      Ativos
                    </Button>
                    <Button
                      className={`px-3 py-1.5 text-sm font-medium rounded-sm ${
                        statusFilter === 'inactive' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                      }`}
                      onClick={() => setStatusFilter('inactive')}
                    >
                      Inativos
                    </Button>
                  </div>
                </div>
              </div>

              {loading && <LoadingSpinner />}

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
                        <th className="text-left py-3 px-4">Nome</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Cursos</th>
                        <th className="text-left py-3 px-4">Data de Entrada</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTutors.map((tutor) => (
                        <tr key={tutor.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="py-3 px-4">{tutor.name}</td>
                          <td className="py-3 px-4">{tutor.email}</td>
                          <td className="py-3 px-4">
                            {tutor.courses.count === 0 ? (
                              <span className="text-gray-500">Nenhum</span>
                            ) : tutor.courses.count === 1 ? (
                              tutor.courses.name
                            ) : (
                              `${tutor.courses.count} cursos`
                            )}
                          </td>
                          <td className="py-3 px-4">{new Date(tutor.joinDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              tutor.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {tutor.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/tutor/${tutor.id}`}>
                                <Button className="border bg-white hover:bg-gray-100">Editar</Button>
                              </Link>                       
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredTutors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum tutor encontrado com os critérios de busca.
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
