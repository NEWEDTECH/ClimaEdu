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

type GestorWithDetails = {
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

export default function GestorPage() {
  const [gestores, setGestores] = useState<GestorWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch content managers and their details
  useEffect(() => {
    const fetchGestores = async () => {
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
        
        // Fetch all content managers
        const gestoresList = await userRepository.listByType(UserRole.CONTENT_MANAGER)
        
        // For each gestor, get their courses
        const gestoresWithDetails = await Promise.all(
          gestoresList.map(async (gestor) => {
            // Get course-tutor associations for this gestor (using same table)
            const courseTutors = await courseTutorRepository.findByUserId(gestor.id)
            
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
            
            // Return gestor with details
            return {
              id: gestor.id,
              name: gestor.name,
              email: gestor.email.value,
              status: 'active' as 'active' | 'inactive', 
              joinDate: gestor.createdAt.toISOString().split('T')[0], 
              courses: coursesInfo
            }
          })
        )
        
        setGestores(gestoresWithDetails)
        setError(null)
      } catch (err) {
        console.error('Error fetching gestores:', err)
        setError('Falha ao carregar gestores de conteúdo. Por favor, tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchGestores()
  }, [])
  
  // Filter gestores based on search term and status
  const filteredGestores = gestores.filter(gestor => {
    const matchesSearch = 
      gestor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      gestor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || gestor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Configuração do Gestor de Conteúdo</h1>
            <Link href="/admin/gestor/create">
              <Button variant='primary'>Adicionar gestor a um curso</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestores de Conteúdo</CardTitle>
              <CardDescription>
                Gerencie todos os gestores de conteúdo na sua plataforma educacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    id="search-gestores"
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
                        statusFilter === 'all' ? 'bg-primary shadow-sm text-white' : 'bg-white text-foreground dark:text-black hover:bg-primary/60'
                      }`}
                      onClick={() => setStatusFilter('all')}
                    >
                      Todos
                    </Button>
                    <Button
                      className={`px-3 py-1.5 text-sm font-medium rounded-sm ${
                        statusFilter === 'active' ? 'bg-primary shadow-sm text-white' : 'bg-white text-foreground dark:text-black hover:bg-primary/60'
                      }`}
                      onClick={() => setStatusFilter('active')}
                    >
                      Ativos
                    </Button>
                    <Button
                      className={`px-3 py-1.5 text-sm font-medium rounded-sm ${
                        statusFilter === 'inactive' ? 'bg-primary shadow-sm text-white' : 'bg-white text-foreground dark:text-black hover:bg-primary/60'
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
                      {filteredGestores.map((gestor) => (
                        <tr key={gestor.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="py-3 px-4">{gestor.name}</td>
                          <td className="py-3 px-4">{gestor.email}</td>
                          <td className="py-3 px-4">
                            {gestor.courses.count === 0 ? (
                              <span className="text-gray-500">Nenhum</span>
                            ) : gestor.courses.count === 1 ? (
                              gestor.courses.name
                            ) : (
                              `${gestor.courses.count} cursos`
                            )}
                          </td>
                          <td className="py-3 px-4">{new Date(gestor.joinDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              gestor.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {gestor.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/gestor/edit/${gestor.id}`}>
                                <Button variant='primary'>Editar</Button>
                              </Link>                       
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredGestores.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum gestor de conteúdo encontrado com os critérios de busca.
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
