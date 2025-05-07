'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { ModuleForm } from '@/components/courses'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { UpdateCourseUseCase } from '@/_core/modules/content/core/use-cases/update-course/update-course.use-case'
import { Course } from '@/_core/modules/content/core/entities/Course'

// Define course data type for the UI
interface CourseFormData {
  id: string;
  title: string;
  description: string;
  institutionId: string;
  // Additional UI fields
  instructor: string;
  duration: string;
  startDate: string;
  endDate: string;
  maxStudents: string;
  price: string;
  category: string;
  level: string;
  enrolledStudents: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export default function TutorEditCoursePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()

  const resolvedParams = 'then' in params ? use(params) : params
  const { id } = resolvedParams
  
  const [formData, setFormData] = useState<CourseFormData>({
    id: '',
    title: '',
    description: '',
    institutionId: '',
    instructor: '',
    duration: '',
    startDate: '',
    endDate: '',
    maxStudents: '',
    price: '',
    category: '',
    level: 'beginner',
    enrolledStudents: 0,
    status: 'active'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true)
        
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )
        
        const course = await courseRepository.findById(id)
        
        if (course) {

          setFormData({
            id: course.id,
            title: course.title,
            description: course.description,
            institutionId: course.institutionId,
            instructor: 'Not specified',
            duration: 'Not specified',
            startDate: '',
            endDate: '',
            maxStudents: '0',
            price: '0',
            category: 'General',
            level: 'beginner',
            enrolledStudents: 0,
            status: 'active',
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
          })
          
          setIsLoading(false)
        } else {
          setError('Curso não encontrado')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching course data:', error)
        setError('Falha ao carregar dados do curso')
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {

      const updateCourseUseCase = container.get<UpdateCourseUseCase>(
        Register.content.useCase.UpdateCourseUseCase
      )
      
      const result = await updateCourseUseCase.execute({
        id: formData.id,
        title: formData.title,
        description: formData.description
      })
      
      router.push('/courses')
    } catch (error) {
      console.error('Erro ao atualizar curso:', error)
      alert(`Falha ao atualizar curso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6 flex justify-center items-center">
            <p>Carregando dados do curso...</p>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
                <p className="mb-4">{error}</p>
                <Link href="/courses">
                  <Button>Voltar para Lista de Cursos</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Editar Curso</h1>
            <Link href="/courses">
              <Button className="border bg-transparent hover:bg-gray-100">Cancelar</Button>
            </Link>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Modules Section */}
                <ModuleForm courseId={id} />
              </CardContent>
              <CardFooter className="flex justify-end gap-2 mt-4">
                <Link href="/courses">
                  <Button className="border bg-transparent hover:bg-gray-100" type="button">Cancelar</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
