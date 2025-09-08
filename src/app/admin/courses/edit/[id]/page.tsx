'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/button'
import { CourseEditLayout } from '@/components/courses/CourseEditLayout'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'

export default function TutorEditCoursePage({ params }: { params: Promise<{ id: string }>}) {

  const resolvedParams = 'then' in params ? use(params) : params
  const { id } = resolvedParams
  
  const [isLoading, setIsLoading] = useState<boolean>(true)
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

  if (isLoading) {
    return (
      <CourseEditLayout courseId={id}>
        <div className="container mx-auto p-6 flex justify-center items-center">
          <p>Carregando dados do curso...</p>
        </div>
      </CourseEditLayout>
    )
  }

  if (error) {
    return (
      <CourseEditLayout courseId={id}>
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
      </CourseEditLayout>
    )
  }

  return (
    <CourseEditLayout courseId={id}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Editar Curso</h1>
          <Link href="/admin/courses">
            <Button className="hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3">Voltar</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Bem-vindo à Edição do Curso</h2>
              <p className="mb-4">Use a sidebar à esquerda para navegar pelos módulos e lições.</p>
              <p className="text-sm">Selecione uma lição para começar a editar seu conteúdo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CourseEditLayout>
  )
}
