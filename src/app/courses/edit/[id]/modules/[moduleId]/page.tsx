'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loader'
import { Button } from '@/components/button'
import { FormSection } from '@/components/form'
import { InputText } from '@/components/input'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { container } from '@/_core/shared/container'
import { Register } from '@/_core/shared/container'
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository'
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository'
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository'


type ModuleFormData = {
  id: string;
  title: string;
  courseId: string;
  order: number;
  lessons: LessonData[];
}


type LessonData = {
  id: string;
  title: string;
  order: number;
  contentsCount: number;
}

const NAME_COLUMNS = [
  '#',
  'Títulos',
  'Conteúdos',
  'Ações'
]

export default function TutorEditModulePage({ params }: { params: Promise<{ id: string, moduleId: string }>}) {
  const router = useRouter()

  const resolvedParams = 'then' in params ? use(params) : params
  const { id: courseId, moduleId } = resolvedParams

  const [formData, setFormData] = useState<ModuleFormData>({
    id: '',
    title: '',
    courseId: '',
    order: 0,
    lessons: []
  })

  const [courseName, setCourseName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState<number>(0)

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setIsLoading(true)

        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        )

        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        )

        const moduleData = await moduleRepository.findById(moduleId)

        if (!moduleData) {
          setError('Módulo não encontrado')
          setIsLoading(false)
          return
        }

        const course = await courseRepository.findById(courseId)

        if (!course) {
          setError('Curso não encontrado')
          setIsLoading(false)
          return
        }

        setCourseName(course.title)

        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        )

        const lessons = await lessonRepository.listByModule(moduleId)

        const lessonsData: LessonData[] = lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          contentsCount: lesson.contents.length
        }))

        lessonsData.sort((a, b) => a.order - b.order)

        setFormData({
          id: moduleData.id,
          title: moduleData.title,
          courseId: moduleData.courseId,
          order: moduleData.order,
          lessons: lessonsData
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching module data:', error)
        setError('Falha ao carregar dados do módulo')
        setIsLoading(false)
      }
    }

    fetchModuleData()
  }, [courseId, moduleId, refreshKey])

  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1)
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const moduleRepository = container.get<ModuleRepository>(
        Register.content.repository.ModuleRepository
      )

      const moduleData = await moduleRepository.findById(moduleId)

      if (!moduleData) {
        throw new Error('Módulo não encontrado')
      }

      moduleData.updateTitle(formData.title)

      await moduleRepository.save(moduleData)

      router.push(`/courses/edit/${courseId}`)
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error)
      alert(`Falha ao atualizar módulo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
                <p className="mb-4">{error}</p>
                <Link href={`/courses/edit/${courseId}`}>
                  <Button>Voltar para o Curso</Button>
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
            <div>
              <h1 className="text-3xl font-bold">Editar Módulo</h1>
              <p className="text-gray-500">Curso: {courseName}</p>
            </div>
            <Link href={`/courses/edit/${courseId}`}>
              <Button className="border bg-transparent hover:bg-gray-100">Voltar para o Curso</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Módulo</CardTitle>
              <CardDescription>
                Atualize os detalhes do módulo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormSection onSubmit={handleSubmit} error={error}>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Título do Módulo
                  </label>
                  <InputText
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Digite o título do módulo"
                    required
                  />
                </div>

                {/* Lessons Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Lições do Módulo</CardTitle>
                      <div className="flex gap-2">
                        <Link href={`/courses/edit/${courseId}/modules/${moduleId}/lessons/create`}>
                          <Button className="text-xs px-3 py-1">Adicionar Lição</Button>
                        </Link>
                      </div>
                    </div>
                    <CardDescription>
                      Gerencie as lições deste módulo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formData.lessons.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Este módulo ainda não possui lições. Adicione uma lição para começar.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                              {NAME_COLUMNS.map(item => (
                                <th key={item} className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">{item}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {formData.lessons.map((lesson, index) => (
                              <tr
                                key={lesson.id}
                                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <td className="px-4 py-3">{index + 1}</td>
                                <td className="px-4 py-3 font-medium">{lesson.title}</td>
                                <td className="px-4 py-3 text-gray-500">
                                  {lesson.contentsCount} {lesson.contentsCount === 1 ? 'conteúdo' : 'conteúdos'}
                                </td>
                                <td className="px-4 py-3 text-left">
                                  <Link href={`/courses/edit/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}>
                                    <Button className="border bg-transparent hover:bg-gray-100 text-xs px-3 py-1">Editar</Button>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2 my-4">
                  <Link href={`/tutor/courses/edit/${courseId}`}>
                    <Button className="border bg-transparent hover:bg-gray-100" type="button">Cancelar</Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </FormSection>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
